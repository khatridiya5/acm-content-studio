import { DesignPlan, Element } from '@/types';

export interface Box { x: number; y: number; w: number; h: number }
const EST: Record<string, number> = { name: 18, role: 11, id: 9, event: 22, department: 24, year: 8, date: 14, venue: 24, tagline: 24 };
const NAMES: Record<string, string> = { name: 'Name', role: 'Role', id: 'Roll no', event: 'Event name', department: 'Department', year: 'Year', date: 'Date', venue: 'Venue', tagline: 'Tagline', photo: 'Photo', logo_acm: 'ACM logo', logo_svnit: 'SVNIT logo' };

export const labelOf = (e: Element) =>
  e.type === 'text' || e.type === 'image' ? NAMES[e.slot] : e.type === 'qr' ? 'QR code' : e.type;

// Rough box of things that carry content (text, images, QR).
export function boxOf(e: Element): Box | null {
  if (e.type === 'image' || e.type === 'qr') return { x: e.x, y: e.y, w: e.w, h: e.h };
  if (e.type === 'text') {
    const w = Math.min(e.maxW ?? 1e9, e.size * 0.56 * (EST[e.slot] ?? 12));
    const x = e.anchor === 'middle' ? e.x - w / 2 : e.anchor === 'end' ? e.x - w : e.x;
    return { x, y: e.y - e.size * 0.85, w, h: e.size * 1.05 };
  }
  return null;
}

const overlap = (a: Box, b: Box) => a.x < b.x + b.w - 0.3 && b.x < a.x + a.w - 0.3 && a.y < b.y + b.h - 0.3 && b.y < a.y + a.h - 0.3;

export function checkBounds(plan: DesignPlan): string[] {
  const out: string[] = [];
  const { w: W, h: H } = plan.size;
  const items = plan.elements.map((e) => ({ e, b: boxOf(e) })).filter((x): x is { e: Element; b: Box } => !!x.b);
  for (const { e, b } of items) {
    const mx = e.type === 'text' ? 1.5 : 2, my = e.type === 'text' ? 0 : 2;
    if (b.x < mx - 0.01 || b.y < my - 0.01 || b.x + b.w > W - mx + 0.01 || b.y + b.h > H - my + 0.01)
      out.push(`${labelOf(e)} is outside the card or too close to the edge.`);
  }
  for (const s of ['logo_acm', 'logo_svnit'] as const) {
    const l = plan.elements.filter((e) => e.type === 'image' && e.slot === s);
    if (l.length !== 1) out.push(`Needs exactly one ${s === 'logo_acm' ? 'ACM' : 'SVNIT'} logo.`);
    for (const e of l) if (e.type === 'image' && (e.w < 7 || e.h < 7)) out.push(`${labelOf(e)} is too small (min 7 mm).`);
  }
  const solid = items.filter((x) => x.e.type === 'image' || x.e.type === 'qr');
  for (let i = 0; i < solid.length; i++) for (let j = i + 1; j < solid.length; j++)
    if (overlap(solid[i].b, solid[j].b)) out.push(`${labelOf(solid[i].e)} overlaps ${labelOf(solid[j].e)}.`);
  return out;
}