// Shrinks long text, then cuts it with "…" so it never leaves its box.
export function fitText(v: string, size: number, maxW: number | undefined, min = 2) {
  if (!maxW) return { text: v, size };
  const width = (s: number, t: string) => t.length * s * 0.56;
  if (width(size, v) <= maxW) return { text: v, size };
  const s = Math.max(min, maxW / (v.length * 0.56));
  if (width(s, v) <= maxW) return { text: v, size: s };
  const n = Math.max(1, Math.floor(maxW / (s * 0.56)) - 1);
  return { text: v.slice(0, n).trimEnd() + '…', size: s };
}