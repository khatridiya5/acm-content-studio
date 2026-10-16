// Fallback templates when Gemini is not available. Keyword-based, not AI.
import { DesignPlan, Element, EventInfo, FieldKey } from '@/types';
import { THEMES, CARD_SIZE } from '@/lib/constants';

interface Pal { bg: string; ink: string; line: string; acc: string }

function decor(t: number, p: Pal): Element[] {
  const A = p.acc, out: Element[] = [];
  if (t === 0) { // horror: drips, moon, texture
    out.push({ type: 'pattern', kind: 'diag', x: 0, y: 0, w: 54, h: 86, color: p.ink, gap: 3, opacity: 0.05 });
    out.push({ type: 'circle', cx: 45, cy: 30, r: 9, fill: p.ink, opacity: 0.08 });
    for (const [x, h] of [[5, 9], [14, 15], [27, 7], [38, 13], [48, 10]]) {
      out.push({ type: 'rect', x: x - 1.1, y: 0, w: 2.2, h, rx: 1.1, fill: A, opacity: 0.9 });
      out.push({ type: 'circle', cx: x, cy: h, r: 1.9, fill: A, opacity: 0.9 });
    }
  } else if (t === 1) { // retro: sun and grid
    out.push({ type: 'pattern', kind: 'grid', x: 0, y: 50, w: 54, h: 36, color: A, gap: 4, opacity: 0.45 });
    out.push({ type: 'circle', cx: 27, cy: 56, r: 16, fill: 'gradient(#ffdd00,#ff00aa)', opacity: 0.5 });
    out.push({ type: 'rect', x: 0, y: 0, w: 54, h: 1, fill: A });
  } else if (t === 2) { // minimal: rings and dots
    out.push({ type: 'circle', cx: 54, cy: 86, r: 26, fill: 'none', stroke: A, sw: 0.3, opacity: 0.5 });
    out.push({ type: 'circle', cx: 54, cy: 86, r: 17, fill: 'none', stroke: A, sw: 0.3, opacity: 0.5 });
    out.push({ type: 'pattern', kind: 'dots', x: 0, y: 0, w: 22, h: 22, color: A, gap: 3, opacity: 0.35 });
  } else if (t === 3) { // nature: leaves
    out.push({ type: 'poly', points: [0, 86, 0, 58, 16, 70, 10, 86], fill: A, opacity: 0.16 });
    out.push({ type: 'poly', points: [54, 0, 54, 26, 38, 14, 44, 0], fill: A, opacity: 0.16 });
    out.push({ type: 'circle', cx: 48, cy: 76, r: 12, fill: A, opacity: 0.1 });
  } else if (t === 4) { // festive: dots and rings
    out.push({ type: 'pattern', kind: 'dots', x: 0, y: 0, w: 54, h: 86, color: A, gap: 4, opacity: 0.18 });
    out.push({ type: 'circle', cx: 0, cy: 86, r: 22, fill: 'none', stroke: A, sw: 0.5, opacity: 0.6 });
    out.push({ type: 'circle', cx: 54, cy: 0, r: 18, fill: A, opacity: 0.15 });
  } else { // corporate: slanted band and stripes
    out.push({ type: 'pattern', kind: 'diag', x: 0, y: 0, w: 54, h: 30, color: A, gap: 3, opacity: 0.12 });
    out.push({ type: 'poly', points: [0, 62, 54, 48, 54, 86, 0, 86], fill: A, opacity: 0.14 });
    out.push({ type: 'circle', cx: 54, cy: 20, r: 12, fill: 'none', stroke: A, sw: 0.3, opacity: 0.5 });
  }
  return out;
}

export function makePlans(text: string, info: EventInfo = {}): DesignPlan[] {
  const t = text.toLowerCase();
  let ti = THEMES.findIndex((h) => h.k.some((w) => t.includes(w)));
  if (ti < 0) ti = 5;
  const th = THEMES[ti];
  const [c1, c2] = th.bg, L = th.line, I = th.ink;
  const light = c1 === '#ffffff';
  const pals: Pal[] = [
    { bg: `gradient(${c1},${c2})`, ink: I, line: L, acc: L },
    light
      ? { bg: 'gradient(#111111,#2b2b2b)', ink: '#ffffff', line: '#ffffff', acc: '#ffffff' }
      : { bg: 'vgradient(#fafafa,#e6e4df)', ink: '#111111', line: '#555555', acc: L },
    { bg: `rgradient(${c2},${c1})`, ink: I, line: L, acc: L },
  ];
  const has = (k: FieldKey) => !info.fields || info.fields.includes(k);
  const bgEl = (p: Pal): Element => ({ type: 'rect', x: 0, y: 0, w: 54, h: 86, fill: p.bg });

  const A = (p: Pal): Element[] => [bgEl(p), ...decor(ti, p), { type: 'rect', x: 0, y: 0, w: 54, h: 13, fill: '$role' },
    { type: 'image', slot: 'logo_acm', x: 3, y: 2, w: 9, h: 9 }, { type: 'image', slot: 'logo_svnit', x: 42, y: 2, w: 9, h: 9 },
    { type: 'text', slot: 'event', x: 27, y: 19, size: 3, anchor: 'middle', maxW: 46, fill: p.ink },
    { type: 'image', slot: 'photo', x: 14, y: 23, w: 26, h: 26, shape: 'circle' },
    { type: 'text', slot: 'name', x: 27, y: 57, size: 6, maxW: 46, anchor: 'middle', weight: 700, fill: p.ink },
    { type: 'rect', x: 14, y: 61, w: 26, h: 6, rx: 3, fill: '$role' },
    { type: 'text', slot: 'role', x: 27, y: 65.2, size: 3, anchor: 'middle', weight: 700, fill: '#111111' },
    { type: 'text', slot: 'department', x: 27, y: 69.8, size: 2.2, anchor: 'middle', maxW: 46, fill: p.ink },
    { type: 'line', x1: 8, y1: 71, x2: 46, y2: 71, stroke: p.line },
    { type: 'qr', x: 22, y: 73, w: 10, h: 10, fill: p.ink },
    { type: 'text', slot: 'year', x: 8, y: 78.6, size: 2.4, anchor: 'start', maxW: 12, fill: p.ink },
    { type: 'text', slot: 'id', x: 27, y: 85.2, size: 2.2, anchor: 'middle', fill: p.ink }];
  const B = (p: Pal): Element[] => [bgEl(p), ...decor(ti, p), { type: 'rect', x: 0, y: 0, w: 7, h: 86, fill: '$role' },
    { type: 'image', slot: 'logo_acm', x: 11, y: 3, w: 9, h: 9 }, { type: 'image', slot: 'logo_svnit', x: 22, y: 3, w: 9, h: 9 },
    { type: 'text', slot: 'event', x: 11, y: 17, size: 2.8, anchor: 'start', maxW: 39, fill: p.ink },
    { type: 'image', slot: 'photo', x: 11, y: 22, w: 32, h: 32, shape: 'rounded' },
    { type: 'text', slot: 'name', x: 11, y: 62, size: 5.5, maxW: 39, anchor: 'start', weight: 700, fill: p.ink },
    { type: 'text', slot: 'role', x: 11, y: 69, size: 3.4, anchor: 'start', weight: 700, fill: '$role' },
    { type: 'text', slot: 'department', x: 11, y: 71.4, size: 2.2, anchor: 'start', maxW: 39, fill: p.ink },
    { type: 'line', x1: 11, y1: 73, x2: 50, y2: 73, stroke: p.line },
    { type: 'qr', x: 11, y: 75, w: 9, h: 9, fill: p.ink },
    { type: 'text', slot: 'id', x: 23, y: 81, size: 2.8, anchor: 'start', fill: p.ink },
    { type: 'text', slot: 'year', x: 23, y: 84.4, size: 2.4, anchor: 'start', maxW: 25, fill: p.ink }];
  const C = (p: Pal): Element[] => [bgEl(p), ...decor(ti, p),
    { type: 'image', slot: 'logo_acm', x: 3, y: 3, w: 9, h: 9 }, { type: 'image', slot: 'logo_svnit', x: 42, y: 3, w: 9, h: 9 },
    { type: 'image', slot: 'photo', x: 19, y: 15, w: 16, h: 16, shape: 'circle' },
    { type: 'text', slot: 'name', x: 27, y: 45, size: 7.5, maxW: 46, anchor: 'middle', weight: 800, fill: p.ink },
    { type: 'text', slot: 'event', x: 27, y: 52, size: 2.8, anchor: 'middle', maxW: 46, fill: p.ink },
    { type: 'text', slot: 'department', x: 27, y: 58.5, size: 2.4, anchor: 'middle', maxW: 30, fill: p.ink },
    { type: 'text', slot: 'year', x: 27, y: 62.5, size: 2.4, anchor: 'middle', maxW: 30, fill: p.ink },
    { type: 'qr', x: 42, y: 55, w: 8, h: 8, fill: p.ink },
    { type: 'rect', x: 0, y: 66, w: 54, h: 20, fill: '$role' },
    { type: 'text', slot: 'role', x: 27, y: 75, size: 5, anchor: 'middle', weight: 800, fill: '#111111' },
    { type: 'text', slot: 'id', x: 27, y: 81, size: 2.6, anchor: 'middle', fill: '#111111' }];

  const keep = (e: Element) => {
    if (e.type === 'qr') return has('qr');
    if (e.type === 'image' && e.slot === 'photo') return has('photo');
    if (e.type === 'text') {
      if (e.slot === 'id') return has('roll');
      if (e.slot === 'department') return has('department');
      if (e.slot === 'year') return has('year');
    }
    return true;
  };
  const names = ['photo-top', 'side-bar', 'big-name'];
  return [A(pals[0]), B(pals[1]), C(pals[2])].map((els, i) => ({ style: names[i], font: th.font, size: CARD_SIZE, elements: els.filter(keep) }));
}