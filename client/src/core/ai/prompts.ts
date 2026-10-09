// TODO (Backend B): prompt text for intake questions and plan generation.
export const PLAN_RULES = `Return JSON only. Use only element types: rect, circle, line, text, image, qr.
Never write real names or event details. Use slots (name, role, id, event, photo, logo_acm, logo_svnit).
Keep every element inside the 54x86 mm card.`;
