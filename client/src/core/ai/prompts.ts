import { DesignPlan, EventInfo } from '@/types';

const SCHEMA = `A design plan is JSON: {"style": string, "font": one of "Helvetica, Arial, sans-serif" | "Georgia, serif" | "Courier New, monospace", "elements": [...]}.
Elements are drawn in order (first = bottom). All numbers are millimetres, origin top-left, y grows downward, card is 54 wide x 86 tall.
 {"type":"rect","x","y","w","h","rx"?,"fill","opacity"?,"stroke"?,"sw"?}
 {"type":"circle","cx","cy","r","fill","opacity"?,"stroke"?,"sw"?}   (fill "none" + stroke = a ring)
 {"type":"line","x1","y1","x2","y2","stroke"}
 {"type":"poly","points":[x1,y1,x2,y2,x3,y3,...] (3 to 12 points),"fill","opacity"?}   (slanted bands, triangles, shards, leaves)
 {"type":"pattern","kind":"dots"|"grid"|"stripes"|"diag","x","y","w","h","color":"#hex or $role","gap"?:1.5-8,"opacity"?}   (texture over an area)
 {"type":"text","slot","x","y","size","maxW"?,"anchor"?:"start"|"middle"|"end","weight"?,"fill"}   (y is the text baseline)
 {"type":"image","slot":"photo"|"logo_acm"|"logo_svnit","x","y","w","h","shape"?:"circle"|"rounded"}
 {"type":"qr","x","y","w","h","fill"}
Text slots: name, role, id (the roll number), event, department, year, date, venue, tagline.
Colors: "#rrggbb", "none", "$role" (the person's role color), or for fill only: gradient(#a,#b) diagonal, vgradient(#a,#b) vertical, rgradient(#a,#b) radial.`;

export const PLAN_RULES = `Rules:
- Never write real names, numbers or event details. Text comes from slots, filled later.
- Both logo_acm and logo_svnit must appear exactly once, each at least 9 x 9 mm and square.
- Keep every image and qr at least 2 mm inside the card, text at least 1.5 mm inside.
- No overlap between photo, logos and qr. Text must not run outside the card.
- Text must have strong contrast with what is behind it.
- The name slot is the most prominent text: size 4.5 to 7.5, maxW 46 or less.
- Use "$role" for at least one visible element so each role looks different.`;

const BRIEF = `Design quality (important): make it look like a professionally designed event badge, not a plain template.
- Start with a full-card background rect using a gradient.
- Add at least 4 decorative elements from poly, circle, ring (circle fill none + stroke), pattern and rect: slanted bands, corner shapes, glow circles (opacity 0.1 to 0.3), dot or grid texture. They must express the theme.
- Decoration goes BEFORE content in the list, and stays at opacity 0.25 or less behind text.
- Use a limited palette of 3 or 4 colors that fit the theme. Strong hierarchy: name biggest, then role, then small details.
- The 3 drafts must clearly differ: palette (one dark, one light, one vivid), composition (for example photo on top, left bar, diagonal split or big name) and decoration style.`;

export function plansPrompt(request: string, info: EventInfo, problems: string[]) {
  const f = info.fields?.join(', ') ?? 'name, role, roll, photo, qr';
  return `You design ID cards as JSON. ${SCHEMA}
${PLAN_RULES}
${BRIEF}
Show ONLY these details as elements: ${f}. (roll = text slot "id"; photo = image slot "photo"; qr = qr element.) Always include the "event" text slot if an event name was given.
Event info given by the user (show date/venue/tagline text slots only if present): ${JSON.stringify({ name: info.name, date: info.date, venue: info.venue, tagline: info.tagline })}
User request / style: """${request}"""
Reply with JSON only: {"plans":[plan,plan,plan]}.
${problems.length ? 'Fix these problems from your last try: ' + problems.join(' | ') : ''}`;
}

export function refinePrompt(plan: DesignPlan, instruction: string) {
  return `You edit an ID card design plan. ${SCHEMA}
${PLAN_RULES}
Current plan: ${JSON.stringify(plan)}
Change request: """${instruction}"""
Apply ONLY what was asked and keep everything else the same. Do not remove required items. Reply with JSON only: {"plan": plan}.`;
}

export function intakePrompt(text: string) {
  return `Read this request for ID cards and extract ONLY what is explicitly written. Copy words exactly as written. Use null for anything not stated. Never guess.
Return JSON: {"name": event name or null, "date": null or text, "venue": null or text, "tagline": null or text, "fields": array of any of ["name","role","roll","department","year","photo","qr"] that the user clearly asked to show, or null}
Request: """${text}"""`;
}