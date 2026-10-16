// Warns when text is hard to read on the color behind it.
import { DesignPlan } from '@/types';
import { ROLE_COLORS } from '@/lib/constants';
import { labelOf } from './bounds';

const ROLE_HEX = Object.values(ROLE_COLORS);
function colors(f: string): string[] {
  if (f === '$role') return ROLE_HEX;
  const g = /^gradient\((#[0-9a-fA-F]{6}),(#[0-9a-fA-F]{6})\)$/.exec(f);
  if (g) return [g[1], g[2]];
  return /^#[0-9a-fA-F]{3,6}$/.test(f) ? [f] : [];
}
function rgb(h: string): [number, number, number] {
  let s = h.slice(1);
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  const n = parseInt(s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const lin = (v: number) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = (h: string) => { const [r, g, b] = rgb(h); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const ratio = (a: string, b: string) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

export function checkContrast(plan: DesignPlan): string[] {
  const out: string[] = [];
  plan.elements.forEach((e, i) => {
    if (e.type !== 'text') return;
    const px = e.x, py = e.y - e.size * 0.3;
    let back: string[] = [];
    for (let j = i - 1; j >= 0 && !back.length; j--) {
      const b = plan.elements[j];
      if (b.type === 'rect' && px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) back = colors(b.fill);
      else if (b.type === 'circle' && (b.opacity ?? 1) >= 0.9 && Math.hypot(px - b.cx, py - b.cy) <= b.r) back = colors(b.fill);
    }
    const fg = colors(e.fill);
    if (!back.length || !fg.length) return;
    let worst = 99;
    for (const f of fg) for (const b of back) worst = Math.min(worst, ratio(f, b));
    if (worst < (e.size >= 4.2 ? 3 : 4.5)) out.push(`${labelOf(e)} text is hard to read (contrast ${worst.toFixed(1)}:1).`);
  });
  return out;
}