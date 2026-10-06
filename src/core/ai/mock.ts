// Mock AI: reads keywords and writes 3 design plans.
// Replace with core/ai/gemini.ts (same DesignPlan output) when ready.
import { DesignPlan, Element } from '@/types';
import { THEMES, CARD_SIZE } from '@/lib/constants';

export function makePlans(text: string): DesignPlan[] {
  const t = text.toLowerCase();
  const th = THEMES.find((h) => h.k.some((w) => t.includes(w))) ?? THEMES[4];
  const [c1, c2] = th.bg, I = th.ink, L = th.line;
  const bg: Element = { type: 'rect', x: 0, y: 0, w: 54, h: 86, fill: `gradient(${c1},${c2})` };
  const logos = (y: number, w: number): Element[] => [
    { type: 'image', slot: 'logo_acm', x: 3, y, w, h: 7 },
    { type: 'image', slot: 'logo_svnit', x: 51 - w, y, w, h: 7 },
  ];
  const A: Element[] = [bg, { type: 'rect', x: 0, y: 0, w: 54, h: 13, fill: '$role' }, ...logos(3, 20),
    { type: 'text', slot: 'event', x: 27, y: 19, size: 3, anchor: 'middle', fill: I },
    { type: 'image', slot: 'photo', x: 14, y: 23, w: 26, h: 26, shape: 'circle' },
    { type: 'text', slot: 'name', x: 27, y: 57, size: 6, maxW: 46, anchor: 'middle', weight: 700, fill: I },
    { type: 'rect', x: 14, y: 61, w: 26, h: 6, rx: 3, fill: '$role' },
    { type: 'text', slot: 'role', x: 27, y: 65.2, size: 3, anchor: 'middle', weight: 700, fill: '#111111' },
    { type: 'line', x1: 8, y1: 71, x2: 46, y2: 71, stroke: L },
    { type: 'qr', x: 22, y: 73, w: 10, h: 10, fill: I },
    { type: 'text', slot: 'id', x: 27, y: 85.2, size: 2.2, anchor: 'middle', fill: I }];
  const B: Element[] = [bg, { type: 'rect', x: 0, y: 0, w: 7, h: 86, fill: '$role' },
    { type: 'image', slot: 'logo_acm', x: 11, y: 4, w: 18, h: 7 }, { type: 'image', slot: 'logo_svnit', x: 32, y: 4, w: 18, h: 7 },
    { type: 'text', slot: 'event', x: 11, y: 17, size: 2.8, anchor: 'start', fill: I },
    { type: 'image', slot: 'photo', x: 11, y: 22, w: 32, h: 32, shape: 'rounded' },
    { type: 'text', slot: 'name', x: 11, y: 62, size: 5.5, maxW: 39, anchor: 'start', weight: 700, fill: I },
    { type: 'text', slot: 'role', x: 11, y: 69, size: 3.4, anchor: 'start', weight: 700, fill: '$role' },
    { type: 'line', x1: 11, y1: 73, x2: 50, y2: 73, stroke: L },
    { type: 'qr', x: 11, y: 75, w: 9, h: 9, fill: I },
    { type: 'text', slot: 'id', x: 23, y: 81, size: 2.8, anchor: 'start', fill: I }];
  const C: Element[] = [bg, { type: 'circle', cx: 54, cy: 0, r: 32, fill: L, opacity: 0.18 }, ...logos(3, 18),
    { type: 'image', slot: 'photo', x: 19, y: 15, w: 16, h: 16, shape: 'circle' },
    { type: 'text', slot: 'name', x: 27, y: 45, size: 7.5, maxW: 46, anchor: 'middle', weight: 800, fill: I },
    { type: 'text', slot: 'event', x: 27, y: 52, size: 2.8, anchor: 'middle', fill: I },
    { type: 'qr', x: 42, y: 55, w: 8, h: 8, fill: I },
    { type: 'rect', x: 0, y: 66, w: 54, h: 20, fill: '$role' },
    { type: 'text', slot: 'role', x: 27, y: 75, size: 5, anchor: 'middle', weight: 800, fill: '#111111' },
    { type: 'text', slot: 'id', x: 27, y: 81, size: 2.6, anchor: 'middle', fill: '#111111' }];
  const names = ['photo-top', 'side-bar', 'big-name'];
  return [A, B, C].map((elements, i) => ({ style: names[i], font: th.font, size: CARD_SIZE, elements }));
}
