// Server-only. Keep GEMINI_API_KEY in client/.env.local.
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DesignPlan, EventInfo, FieldKey } from '@/types';
import { makePlans } from './mock';

async function askJson(prompt: string): Promise<Record<string, unknown>> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');
  const model = new GoogleGenerativeAI(key).getGenerativeModel({
    model: process.env.MODEL || 'gemini-3.8-flash',
    generationConfig: { responseMimeType: 'application/json', temperature: 0.8 },
  });
  const res = await model.generateContent(prompt);
  const text = res.response.text().replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
  return JSON.parse(text);
}

async function askSvg(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');
  const model = new GoogleGenerativeAI(key).getGenerativeModel({
    model: process.env.MODEL || 'gemini-3.8-flash',
    generationConfig: { temperature: 0.8 },
  });
  const res = await model.generateContent(prompt);
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

export async function extractIntake(text: string) {
  const prompt = `Read this request for ID cards and extract ONLY what is explicitly written. Copy words exactly as written. Use null for anything not stated. Never guess.
Return JSON: {"name": event name or null, "date": null or text, "venue": null or text, "tagline": null or text, "fields": array of any of ["name","role","roll","department","year","photo","qr"] that the user clearly asked to show, or null}
Request: """${text}"""`;
  return askJson(prompt);
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

TECHNICAL RULES (mandatory)
- Orientation: ${orientation}. Use exactly: width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}". All coordinates are in mm.
- Include xmlns="http://www.w3.org/2000/svg" and xmlns:xlink="http://www.w3.org/1999/xlink" on the svg tag.
- Fonts: only Arial, Helvetica, sans-serif.
- Both the ACM logo (/brand/acm_logo.png) and SVNIT logo (/brand/svnit_logo.jpg) must appear on the card, square, at least 8x8mm, and placed cleanly without overlapping other elements.
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
    console.log(`[Gemini] Requesting 3 design variations for event: "${eventName}", theme: "${theme.slice(0, 80)}" using model: ${process.env.MODEL || 'gemini-3.8-flash'}`);
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

  if (typeof plan === 'string') {
    return updatedSvg as unknown as DesignPlan;
  }
  return {
    ...plan,
    svg: updatedSvg,
  };
}