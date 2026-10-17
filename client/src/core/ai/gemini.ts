// Server-only. Keep GEMINI_API_KEY in client/.env.local.
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DesignPlan, EventInfo, FieldKey } from '@/types';

async function askJson(prompt: string): Promise<Record<string, unknown>> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');
  const model = new GoogleGenerativeAI(key).getGenerativeModel({
    model: process.env.MODEL || 'gemini-2.5-flash',
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
    model: process.env.MODEL || 'gemini-2.5-flash',
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

function getDynamicPlaceholders(fields?: FieldKey[]): string {
  const active = fields && fields.length > 0 ? fields : ['name', 'role', 'roll', 'photo'];
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

const DEFAULT_SVG_TEMPLATES = [
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="54mm" height="86mm" viewBox="0 0 54 86">
  <defs>
    <clipPath id="cardClip1"><rect width="54" height="86" rx="3" ry="3"/></clipPath>
    <clipPath id="photoClip1"><circle cx="27" cy="33" r="13"/></clipPath>
    <linearGradient id="bgGrad1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#cardClip1)">
    <rect width="54" height="86" fill="url(#bgGrad1)"/>
    <circle cx="50" cy="10" r="22" fill="#38bdf8" opacity="0.15"/>
    <circle cx="4" cy="75" r="20" fill="#818cf8" opacity="0.12"/>
    <image x="3" y="3" width="10" height="10" preserveAspectRatio="xMidYMid meet" xlink:href="/brand/acm_logo.png"/>
    <image x="41" y="3" width="10" height="10" preserveAspectRatio="xMidYMid meet" xlink:href="/brand/svnit_logo.jpg"/>
    <text x="27" y="10" font-family="Arial, Helvetica, sans-serif" font-size="2.6" font-weight="bold" fill="#38bdf8" text-anchor="middle">ACM SVNIT</text>
    <circle cx="27" cy="33" r="14" fill="#1e293b" stroke="#38bdf8" stroke-width="0.8"/>
    <circle cx="27" cy="33" r="13" fill="#64748b"/>
    <image x="14" y="20" width="26" height="26" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip1)" xlink:href="{{photo}}"/>
    <text x="27" y="53" font-family="Arial, Helvetica, sans-serif" font-size="5" font-weight="bold" fill="#ffffff" text-anchor="middle">{{name}}</text>
    <rect x="10" y="56" width="34" height="5" rx="2.5" fill="#38bdf8" opacity="0.2"/>
    <text x="27" y="59.7" font-family="Arial, Helvetica, sans-serif" font-size="2.6" font-weight="bold" fill="#38bdf8" text-anchor="middle">{{position}}</text>
    <text x="27" y="66" font-family="Arial, Helvetica, sans-serif" font-size="2.4" fill="#94a3b8" text-anchor="middle">{{roll_no}}</text>
    <text x="27" y="70" font-family="Arial, Helvetica, sans-serif" font-size="2.2" fill="#64748b" text-anchor="middle">{{department}}</text>
    <rect x="0" y="81" width="54" height="5" fill="#38bdf8" opacity="0.8"/>
    <text x="27" y="84.5" font-family="Arial, Helvetica, sans-serif" font-size="2.2" font-weight="bold" fill="#0f172a" text-anchor="middle">OFFICIAL BADGE</text>
  </g>
</svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="54mm" height="86mm" viewBox="0 0 54 86">
  <defs>
    <clipPath id="cardClip2"><rect width="54" height="86" rx="3" ry="3"/></clipPath>
    <clipPath id="photoClip2"><rect x="15" y="21" width="24" height="24" rx="4" ry="4"/></clipPath>
  </defs>
  <g clip-path="url(#cardClip2)">
    <rect width="54" height="86" fill="#f8fafc"/>
    <rect x="0" y="0" width="54" height="17" fill="#1e293b"/>
    <image x="3" y="3" width="11" height="11" preserveAspectRatio="xMidYMid meet" xlink:href="/brand/acm_logo.png"/>
    <image x="40" y="3" width="11" height="11" preserveAspectRatio="xMidYMid meet" xlink:href="/brand/svnit_logo.jpg"/>
    <text x="27" y="10" font-family="Arial, Helvetica, sans-serif" font-size="2.8" font-weight="bold" fill="#ffffff" text-anchor="middle">ACM SVNIT</text>
    <rect x="14" y="20" width="26" height="26" rx="5" ry="5" fill="#e2e8f0" stroke="#0ea5e9" stroke-width="0.8"/>
    <rect x="15" y="21" width="24" height="24" rx="4" ry="4" fill="#cbd5e1"/>
    <image x="15" y="21" width="24" height="24" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip2)" xlink:href="{{photo}}"/>
    <text x="27" y="53" font-family="Arial, Helvetica, sans-serif" font-size="4.8" font-weight="bold" fill="#0f172a" text-anchor="middle">{{name}}</text>
    <text x="27" y="58" font-family="Arial, Helvetica, sans-serif" font-size="2.6" font-weight="bold" fill="#0284c7" text-anchor="middle">{{position}}</text>
    <text x="27" y="63" font-family="Arial, Helvetica, sans-serif" font-size="2.3" fill="#64748b" text-anchor="middle">{{roll_no}}</text>
    <text x="27" y="67" font-family="Arial, Helvetica, sans-serif" font-size="2.1" fill="#94a3b8" text-anchor="middle">{{department}}</text>
    <line x1="8" y1="72" x2="46" y2="72" stroke="#e2e8f0" stroke-width="0.5"/>
    <text x="27" y="79" font-family="Arial, Helvetica, sans-serif" font-size="2.4" font-weight="bold" fill="#0369a1" text-anchor="middle">EVENT PARTICIPANT</text>
  </g>
</svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="54mm" height="86mm" viewBox="0 0 54 86">
  <defs>
    <clipPath id="cardClip3"><rect width="54" height="86" rx="3" ry="3"/></clipPath>
    <clipPath id="photoClip3"><circle cx="27" cy="32" r="13"/></clipPath>
    <linearGradient id="bgGrad3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#18181b"/>
      <stop offset="100%" stop-color="#2e1065"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#cardClip3)">
    <rect width="54" height="86" fill="url(#bgGrad3)"/>
    <polygon points="0,0 54,0 54,20 0,35" fill="#7c3aed" opacity="0.3"/>
    <image x="3" y="3" width="11" height="11" preserveAspectRatio="xMidYMid meet" xlink:href="/brand/acm_logo.png"/>
    <image x="40" y="3" width="11" height="11" preserveAspectRatio="xMidYMid meet" xlink:href="/brand/svnit_logo.jpg"/>
    <text x="27" y="10" font-family="Arial, Helvetica, sans-serif" font-size="2.6" font-weight="bold" fill="#a78bfa" text-anchor="middle">ACM SVNIT</text>
    <circle cx="27" cy="32" r="14" fill="#2e1065" stroke="#a78bfa" stroke-width="0.8"/>
    <circle cx="27" cy="32" r="13" fill="#4c1d95"/>
    <image x="14" y="19" width="26" height="26" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip3)" xlink:href="{{photo}}"/>
    <text x="27" y="52" font-family="Arial, Helvetica, sans-serif" font-size="5" font-weight="bold" fill="#ffffff" text-anchor="middle">{{name}}</text>
    <text x="27" y="57.5" font-family="Arial, Helvetica, sans-serif" font-size="2.8" font-weight="bold" fill="#c084fc" text-anchor="middle">{{position}}</text>
    <text x="27" y="63" font-family="Arial, Helvetica, sans-serif" font-size="2.4" fill="#d8b4fe" text-anchor="middle">{{roll_no}}</text>
    <text x="27" y="67.5" font-family="Arial, Helvetica, sans-serif" font-size="2.1" fill="#9ca3af" text-anchor="middle">{{department}}</text>
    <rect x="8" y="74" width="38" height="6" rx="3" fill="#7c3aed" opacity="0.4"/>
    <text x="27" y="78.2" font-family="Arial, Helvetica, sans-serif" font-size="2.3" font-weight="bold" fill="#ffffff" text-anchor="middle">ACM SVNIT CHAPTER</text>
  </g>
</svg>`
];

export async function generatePlans(userPrompt: string, info: EventInfo) {
  const good: string[] = [];
  const eventName = info.name || 'ACM Tech Event';
  const theme = userPrompt || 'Modern tech conference / hackathon';
  const notes = [info.tagline, info.venue, info.date].filter(Boolean).join(' | ') || 'Student tech club event';
  const orientation = 'portrait';
  const w = '54';
  const h = '86';
  const dynamicPlaceholders = getDynamicPlaceholders(info.fields);

  const basePrompt = `Design an ID card for an event as a single, self-contained SVG file. Return ONLY the raw SVG code, with no explanation and no markdown fences.

EVENT DETAILS (decided by the client)
- Event name: ${eventName}
- Theme / mood / colors: ${theme}
- Organizer: ACM NIT Surat (student tech club)
- Extra notes: ${notes}

DESIGN
- Create a visual style, color palette, layout and decorative elements that clearly reflect the event and its theme.
- Show the event name on the card as static text (not a placeholder).
- Modern, professional, print-ready. Every text element must be easy to read, must not overlap other elements, and must not leave the card.

TECHNICAL RULES (mandatory)
- Orientation: ${orientation}. Use exactly: width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}". All coordinates are in mm.
- Include xmlns="http://www.w3.org/2000/svg" and xmlns:xlink="http://www.w3.org/1999/xlink" on the svg tag.
- Fonts: only Arial, Helvetica, sans-serif.
- Both the ACM logo (/brand/acm_logo.png) and SVNIT logo (/brand/svnit_logo.jpg) must appear on the card, square, at least 8x8mm, and placed cleanly without overlapping other elements.
- Must render in CairoSVG: no external resources, no scripts, no CSS animations, no <foreignObject>, no filters, no masks. Gradients, clipPath and simple shapes are fine.
- Keep important content at least 3 mm inside the edges. Background shapes may reach the edges.
- Clip everything to the card rectangle with a clipPath.

REQUIRED PLACEHOLDERS (copy exactly, each used once)
${dynamicPlaceholders}

Do not add any other {{placeholders}} and do not replace these with sample data.`;


  const variations = [
    `${basePrompt}\n\nSTYLE VARIATION: Dark, sleek, futuristic tech style with gradient accent lines and high contrast.`,
    `${basePrompt}\n\nSTYLE VARIATION: Clean, bright minimalist style with elegant framing, subtle badges, and light background.`,
    `${basePrompt}\n\nSTYLE VARIATION: Bold dynamic geometric style with diagonal bands and vibrant energetic colors.`
  ];

  if (process.env.GEMINI_API_KEY) {
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
  } else {
    console.warn('[Gemini] GEMINI_API_KEY is not set. Using default templates.');
  }

  const toDesignPlan = (svg: string, idx: number): DesignPlan => ({
    style: `draft_${idx + 1}`,
    font: 'Arial, Helvetica, sans-serif',
    size: { w: 54, h: 86 },
    elements: [],
    svg,
  });

  let notice = '';
  if (good.length === 0) {
    console.warn('[Gemini] No valid SVGs generated. Falling back to default mock templates.');
    return {
      plans: DEFAULT_SVG_TEMPLATES.map(toDesignPlan),
      source: 'fallback',
      notice: 'Gemini was not available. Showing default card designs.',
    };
  }

  if (good.length < 3) {
    let fi = 0;
    while (good.length < 3) {
      good.push(DEFAULT_SVG_TEMPLATES[fi % DEFAULT_SVG_TEMPLATES.length]);
      fi++;
    }
    notice = 'Gemini generated some designs, and default templates filled the rest.';
  }

  return { plans: good.map(toDesignPlan), source: notice ? 'mixed' : 'gemini', notice };
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