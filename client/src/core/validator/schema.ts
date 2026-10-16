// Checks AI output before drawing. Anything not in this list is rejected.
import { z } from 'zod';
import { FONTS } from '@/lib/constants';

const num = z.number().finite().min(-50).max(250);
const pos = z.number().finite().positive().max(250);
const op = z.number().min(0).max(1).optional();
const sw = z.number().min(0.1).max(3).optional();
const solid = z.string().regex(/^(\$role|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})$/);
const color = z.string().regex(/^(\$role|none|#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6}|[vr]?gradient\(#[0-9a-fA-F]{6},#[0-9a-fA-F]{6}\))$/);
const slot = z.enum(['name', 'role', 'id', 'event', 'department', 'year', 'date', 'venue', 'tagline']);

const el = z.discriminatedUnion('type', [
  z.object({ type: z.literal('rect'), x: num, y: num, w: pos, h: pos, rx: num.optional(), fill: color, opacity: op, stroke: color.optional(), sw }),
  z.object({ type: z.literal('circle'), cx: num, cy: num, r: pos, fill: color, opacity: op, stroke: color.optional(), sw }),
  z.object({ type: z.literal('line'), x1: num, y1: num, x2: num, y2: num, stroke: color }),
  z.object({ type: z.literal('poly'), points: z.array(num).min(6).max(24).refine((a) => a.length % 2 === 0), fill: color, opacity: op }),
  z.object({ type: z.literal('pattern'), kind: z.enum(['dots', 'grid', 'stripes', 'diag']), x: num, y: num, w: pos, h: pos, color: solid, gap: z.number().min(1.5).max(8).optional(), opacity: op }),
  z.object({ type: z.literal('text'), slot, x: num, y: num, size: z.number().min(1.5).max(20), maxW: pos.optional(), anchor: z.enum(['start', 'middle', 'end']).optional(), weight: num.optional(), fill: color }),
  z.object({ type: z.literal('image'), slot: z.enum(['photo', 'logo_acm', 'logo_svnit']), x: num, y: num, w: pos, h: pos, shape: z.enum(['circle', 'rounded']).optional() }),
  z.object({ type: z.literal('qr'), x: num, y: num, w: pos, h: pos, fill: color }),
]);

export const planSchema = z.object({
  style: z.string().max(40),
  font: z.enum(FONTS),
  size: z.object({ w: pos, h: pos }),
  elements: z.array(el).min(1).max(48),
});