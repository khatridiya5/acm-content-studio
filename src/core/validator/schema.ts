// Checks AI output before drawing. Anything not in this list is rejected.
import { z } from 'zod';

const num = z.number().finite();
const el = z.discriminatedUnion('type', [
  z.object({ type: z.literal('rect'), x: num, y: num, w: num, h: num, rx: num.optional(), fill: z.string() }),
  z.object({ type: z.literal('circle'), cx: num, cy: num, r: num, fill: z.string(), opacity: num.optional() }),
  z.object({ type: z.literal('line'), x1: num, y1: num, x2: num, y2: num, stroke: z.string() }),
  z.object({ type: z.literal('text'), slot: z.enum(['name', 'role', 'id', 'event']), x: num, y: num, size: num, maxW: num.optional(), anchor: z.enum(['start', 'middle', 'end']).optional(), weight: num.optional(), fill: z.string() }),
  z.object({ type: z.literal('image'), slot: z.enum(['photo', 'logo_acm', 'logo_svnit']), x: num, y: num, w: num, h: num, shape: z.enum(['circle', 'rounded']).optional() }),
  z.object({ type: z.literal('qr'), x: num, y: num, w: num, h: num, fill: z.string() }),
]);

export const planSchema = z.object({
  style: z.string(),
  font: z.string(),
  size: z.object({ w: num, h: num }),
  elements: z.array(el).min(1),
});
