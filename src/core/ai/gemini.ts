// Server-only. Keep GEMINI_API_KEY in client/.env.local.
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DesignPlan, EventInfo, FieldKey } from '@/types';
import { makePlans } from './mock';
import { makeCertificatePlans } from './certificate';
import { CERTIFICATE_SIZE } from '@/lib/constants';
import { extractHeuristicIntake } from './intake';

async function askJsonWithTimeout(prompt: string, timeoutMs = 7000): Promise<Record<string, unknown>> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');
  const model = new GoogleGenerativeAI(key).getGenerativeModel({
    model: process.env.MODEL || 'gemini-3.5-flash',
    generationConfig: { responseMimeType: 'application/json', temperature: 0.0 },
  });
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Gemini JSON request timed out after ${timeoutMs}ms`)), timeoutMs)
  );
  const res = await Promise.race([model.generateContent(prompt), timeoutPromise]);
  const text = res.response.text().replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
  return JSON.parse(text);
}

async function askSvg(prompt: string, timeoutMs = 45000): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');
  const model = new GoogleGenerativeAI(key).getGenerativeModel({
    model: process.env.MODEL || 'gemini-3.5-flash',
    generationConfig: { temperature: 0.8 },
  });
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Gemini SVG generation timed out after ${timeoutMs}ms`)), timeoutMs)
  );
  const res = await Promise.race([model.generateContent(prompt), timeoutPromise]);
  let text = res.response.text().trim();
  // Strip any markdown code blocks
  text = text.replace(/^```(?:xml|svg)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const start = text.indexOf('<svg');
  const end = text.lastIndexOf('</svg>');
  if (start !== -1 && end !== -1) {
    text = text.slice(start, end + 6);
  }
  return text;
}

export async function extractIntake(text: string): Promise<Record<string, unknown>> {
  const fastHeuristic = extractHeuristicIntake(text);
  const prompt = `Read this request for ID cards and extract ONLY what is explicitly written. Copy words exactly as written. Use null for anything not stated. Never guess.
Return JSON: {"name": event name or null, "date": null or text, "venue": null or text, "tagline": null or text, "fields": array of any of ["name","role","roll","department","year","photo","qr"] that the user clearly asked to show, or null}
Request: """${text}"""`;

  try {
    const aiResult = await askJsonWithTimeout(prompt, 7000);
    return {
      name: aiResult.name || fastHeuristic.name,
      date: aiResult.date || fastHeuristic.date,
      venue: aiResult.venue || fastHeuristic.venue,
      tagline: aiResult.tagline || fastHeuristic.tagline,
      fields: Array.isArray(aiResult.fields) && aiResult.fields.length ? aiResult.fields : fastHeuristic.fields,
    };
  } catch (err) {
    console.warn('[Gemini] extractIntake timed out or failed, using fast heuristic extraction:', err instanceof Error ? err.message : err);
    return fastHeuristic;
  }
}

function getDynamicPlaceholders(fields?: FieldKey[], hasPhotos?: boolean): string {
  let active = fields && fields.length > 0 ? [...fields] : ['name', 'role', 'roll', 'photo'];
  if (hasPhotos === false) {
    active = active.filter((f) => f !== 'photo');
  }
  const list: string[] = [];

  if (active.includes('name')) {
    list.push('- {{name}}        : full name as text. Most prominent text. Must stay readable for ~18 characters.');
  }
  if (active.includes('role')) {
    list.push('- {{position}}    : text (e.g. "Technical Lead", "Participant")');
  }
  if (active.includes('roll')) {
    list.push('- {{roll_no}}     : text (e.g. "U23CS101")');
  }
  if (active.includes('department')) {
    list.push('- {{department}}  : text, up to ~32 characters');
  }
  if (active.includes('year')) {
    list.push('- {{year}}        : academic year text (e.g. "3rd Year", "2024-2028")');
  }
  if (active.includes('photo')) {
    list.push(`- {{photo}}       : the href of the person's photo:
  <image x=".." y=".." width=".." height=".." preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)" xlink:href="{{photo}}"/>
  Define photoClip in <defs> to match a shaped frame (circle, rounded rect, hexagon...), with a grey fallback shape behind it.`);
  }
  if (active.includes('qr')) {
    list.push(`- {{qr}}          : QR code element or placeholder:
  <image x=".." y=".." width=".." height=".." preserveAspectRatio="xMidYMid meet" xlink:href="{{qr}}"/>`);
  }

  list.push(`- ACM Logo (official student chapter logo, square, at least 8x8mm):
  <image x=".." y=".." width=".." height=".." preserveAspectRatio="xMidYMid meet" xlink:href="/brand/acm_logo.png"/>
- SVNIT Logo (institute logo, square, at least 8x8mm):
  <image x=".." y=".." width=".." height=".." preserveAspectRatio="xMidYMid meet" xlink:href="/brand/svnit_logo.jpg"/>`);

  return list.join('\n');
}

export async function generatePlans(userPrompt: string, info: EventInfo) {
  const good: string[] = [];
  const eventName = info.name || 'ACM Tech Event';
  const theme = userPrompt || 'Modern tech conference / hackathon';
  const notes = [info.tagline, info.venue, info.date].filter(Boolean).join(' | ') || 'Student tech club event';
  const orientation = 'portrait';
  const w = '54';
  const h = '86';
  const dynamicPlaceholders = getDynamicPlaceholders(info.fields, info.hasPhotos);

  const basePrompt = `Design an ID card for an event as a single, self-contained SVG file. Return ONLY the raw SVG code, with no explanation and no markdown fences.

EVENT DETAILS (decided by the client)
- Event name: ${eventName}
- Theme / mood / colors: ${theme}
- Organizer: ACM NIT Surat (student tech club)
- Date / Venue / Extra notes: ${notes}

DESIGN
- Create a visual style, color palette, layout and decorative elements that clearly reflect the event and its theme.
- Show the event name on the card as static text (not a placeholder).
- If date, venue, or tagline are provided in notes, you may include them as clean, subtle static text.
- Modern, professional, print-ready. Every text element must be easy to read, must not overlap other elements, and must not leave the card.
- High contrast is strictly required: text on badges/pill containers (e.g. {{position}}) must have strong contrast (use white text on dark containers, dark text on bright containers; never use dark text on dark badges).

TECHNICAL RULES (mandatory)
- Orientation: ${orientation}. Use exactly: width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}". All coordinates are in mm.
- Include xmlns="http://www.w3.org/2000/svg" and xmlns:xlink="http://www.w3.org/1999/xlink" on the svg tag.
- Fonts: only Arial, Helvetica, sans-serif.
- Both the ACM logo (/brand/acm_logo.png) and SVNIT logo (/brand/svnit_logo.jpg) must appear on the card, square, at least 10x10mm to 11.5x11.5mm, and placed cleanly without overlapping other elements.
- Must render in CairoSVG: no external resources, no scripts, no CSS animations, no <foreignObject>, no filters, no masks. Gradients, clipPath and simple shapes are fine.
- Keep all content at least 5 mm inside the edges. Background shapes and design element may reach the edges.
- Clip everything to the card rectangle with a clipPath.

REQUIRED PLACEHOLDERS (copy exactly, each used once)
${dynamicPlaceholders}

Do not add any other {{placeholders}} and do not replace these with sample data.`;

  const variations = [
    `${basePrompt}\n\nSTYLE VARIATION 1: Dark, technical theme style with high contrast, glowing neon or rich accent lines, and deep background.`,
    `${basePrompt}\n\nSTYLE VARIATION 2: Clean, minimalist style with crisp typography, subtle borders, and light/clean background.`,
    `${basePrompt}\n\nSTYLE VARIATION 3: Bold graphic geometric style with energetic angled shapes, vibrant accents, and modern tech badge aesthetic keep it minimalistic subtle design.`
  ];

  if (process.env.GEMINI_API_KEY) {
    console.log(`[Gemini] Requesting 3 design variations for event: "${eventName}", theme: "${theme.slice(0, 80)}" using model: ${process.env.MODEL || 'gemini-3.5-flash'}`);
    const results = await Promise.allSettled(variations.map((p) => askSvg(p)));
    for (let i = 0; i < results.length; i++) {
      const res = results[i];
      if (res.status === 'fulfilled' && res.value && res.value.includes('<svg') && res.value.includes('</svg>')) {
        good.push(res.value);
      } else {
        const reason = res.status === 'rejected' ? res.reason : 'Invalid SVG';
        console.warn(`[Gemini] Draft ${i + 1} generation failed:`, reason);
      }
    }
    console.log(`[Gemini] Generated ${good.length} valid SVGs from Gemini API.`);
  } else {
    console.warn('[Gemini] GEMINI_API_KEY is not set. Using default templates.');
  }

  if (good.length === 0) {
    console.warn('[Gemini] No valid SVGs generated. Falling back to mock templates.');
    return {
      plans: makePlans(userPrompt, info),
      source: 'fallback',
      notice: 'Gemini was not available. Showing default card designs based on your theme.',
    };
  }

  const toDesignPlan = (svg: string, idx: number): DesignPlan => ({
    style: `draft_${idx + 1}`,
    font: 'Arial, Helvetica, sans-serif',
    size: { w: 54, h: 86 },
    elements: [],
    svg,
  });

  const finalPlans: DesignPlan[] = good.map(toDesignPlan);

  let notice = '';
  if (finalPlans.length < 3) {
    const fallbackPlans = makePlans(userPrompt, info);
    let fi = 0;
    while (finalPlans.length < 3 && fi < fallbackPlans.length) {
      finalPlans.push(fallbackPlans[fi]);
      fi++;
    }
    notice = 'Gemini generated some designs, and default templates filled the rest.';
  }

  return { plans: finalPlans, source: notice ? 'mixed' : 'gemini', notice };
}

export async function generateCertificatePlans(userPrompt: string, info: EventInfo) {
  const good: string[] = [];
  const eventName = info.name || 'ACM Tech Event';
  const theme = userPrompt || 'Classic academic honor / tech achievement';
  const date = info.date || '2026';
  const w = '297';
  const h = '210';

  const basePrompt = `Design a formal event certificate as a single, self-contained SVG file in A4 Landscape orientation. Return ONLY the raw SVG code, with no explanation and no markdown fences.

EVENT DETAILS:
- Event name: ${eventName}
- Theme / style notes: ${theme}
- Organizer: ACM NIT Surat Student Chapter in association with SVNIT Surat
- Date: ${date}

DESIGN RULES:
- Orientation: Landscape. Use exactly: width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}". All coordinates are in mm.
- Include xmlns="http://www.w3.org/2000/svg" and xmlns:xlink="http://www.w3.org/1999/xlink" on the svg tag.
- Typography: elegant serif (Georgia, serif) or modern sans-serif (Arial, Helvetica, sans-serif).
- Double borders, ornate or geometric corner brackets, and stately institutional layout.
- Both official logos must appear at the top header (at least 18x18mm):
  ACM Logo: <image x="24" y="20" width="22" height="22" preserveAspectRatio="xMidYMid meet" xlink:href="/brand/acm_logo.png"/>
  SVNIT Logo: <image x="251" y="20" width="22" height="22" preserveAspectRatio="xMidYMid meet" xlink:href="/brand/svnit_logo.jpg"/>
- Must render in CairoSVG: no external fonts, no scripts, no CSS animations, no <foreignObject>, no HTML tags. Simple gradients and clipPaths are fine.
- Dual signature lines at the bottom (left & right) with clear horizontal lines and signatory text underneath.
- Digital verification QR code placeholder in center or bottom corner:
  <image x="139.5" y="159" width="18" height="18" preserveAspectRatio="xMidYMid meet" xlink:href="{{qr}}"/>

REQUIRED PLACEHOLDERS (copy exactly as written, each used once):
- {{certificate_heading}}     : the main certificate word ("CERTIFICATE", elegant prominent heading)
- {{certificate_subheading}}  : the specific award line ("OF EXCELLENCE", "OF APPRECIATION", "OF PARTICIPATION", in smaller font size)
- {{presentation_text}}       : presentation subtitle (e.g. "This certificate is proudly awarded to")
- {{name}}                    : recipient full name (prominent text, ~8-9mm size, centered, with data-maxw="230")
- {{citation}}           : citation or achievement text
- {{date}}               : issue date
- {{signatory_1}}        : left signatory name (e.g. Faculty Advisor)
- {{signatory_1_title}}  : left signatory title (e.g. Faculty Sponsor, ACM SVNIT)
- {{signature_1}}        : optional left signature image href placed above the left signature line
- {{signatory_2}}        : right signatory name (e.g. Chapter Chairperson)
- {{signatory_2_title}}  : right signatory title (e.g. Chairperson, ACM SVNIT)
- {{signature_2}}        : optional right signature image href placed above the right signature line
- {{qr}}                 : QR verification code href`;

  const variations = [
    `${basePrompt}\n\nSTYLE VARIATION 1: Classic Honor - Deep navy and gold accents, ornate double border with corner flourishes, elegant serif typography, traditional prestigious award aesthetic.`,
    `${basePrompt}\n\nSTYLE VARIATION 2: Modern Tech - Dark cyber-inspired or deep-slate background, neon cyan/violet glowing accent lines, tech grid framing, geometric modern typography.`,
    `${basePrompt}\n\nSTYLE VARIATION 3: Minimalist Crest - Clean bright white background with royal ACM blue ribbon header, delicate borders, elegant centered layout, crisp institutional aesthetic.`
  ];

  if (process.env.GEMINI_API_KEY) {
    console.log(`[Gemini] Requesting 3 certificate variations for event: "${eventName}" using model: ${process.env.MODEL || 'gemini-3.8-flash'}`);
    const results = await Promise.allSettled(variations.map((p) => askSvg(p)));
    for (let i = 0; i < results.length; i++) {
      const res = results[i];
      if (res.status === 'fulfilled' && res.value && res.value.includes('<svg') && res.value.includes('</svg>')) {
        good.push(res.value);
      } else {
        const reason = res.status === 'rejected' ? res.reason : 'Invalid SVG';
        console.warn(`[Gemini] Certificate Draft ${i + 1} failed:`, reason);
      }
    }
  }

  if (good.length === 0) {
    console.warn('[Gemini] No valid certificate SVGs generated. Falling back to mock templates.');
    return {
      plans: makeCertificatePlans(userPrompt, info),
      source: 'fallback',
      notice: 'Gemini was not available. Showing default certificate designs based on your event.',
    };
  }

  const toDesignPlan = (svg: string, idx: number): DesignPlan => ({
    style: `cert_draft_${idx + 1}`,
    font: idx === 0 ? 'Georgia, serif' : 'Arial, Helvetica, sans-serif',
    size: CERTIFICATE_SIZE,
    elements: [],
    svg,
    docType: 'certificate',
  });

  const finalPlans: DesignPlan[] = good.map(toDesignPlan);

  let notice = '';
  if (finalPlans.length < 3) {
    const fallbackPlans = makeCertificatePlans(userPrompt, info);
    let fi = 0;
    while (finalPlans.length < 3 && fi < fallbackPlans.length) {
      finalPlans.push(fallbackPlans[fi]);
      fi++;
    }
    notice = 'Gemini generated some certificate designs, and default templates filled the rest.';
  }

  return { plans: finalPlans, source: notice ? 'mixed' : 'gemini', notice };
}

export async function refinePlan(plan: DesignPlan | string, instruction: string): Promise<DesignPlan> {
  const currentSvg = typeof plan === 'string' ? plan : plan.svg || '';
  if (!currentSvg) {
    throw new Error('No SVG content available to refine.');
  }

  const prompt = `You edit an ID card SVG file.
Current SVG:
${currentSvg}

Change request: """${instruction}"""
Apply ONLY what was requested. Return ONLY the updated self-contained raw SVG code, with no explanation and no markdown fences.`;

  const updatedSvg = await askSvg(prompt);
  if (!updatedSvg.includes('<svg') || !updatedSvg.includes('</svg>')) {
    throw new Error('Gemini gave an invalid SVG response when refining.');
  }

  const changed = currentSvg.trim() !== updatedSvg.trim();
  console.log(`[refinePlan] Refinement completed. Did SVG change? ${changed}`);
  if (!changed) {
    console.warn('[refinePlan] Warning: Gemini returned identical SVG content.');
  }

  if (typeof plan === 'string') {
    return updatedSvg as unknown as DesignPlan;
  }
  return {
    ...plan,
    svg: updatedSvg,
  };
}