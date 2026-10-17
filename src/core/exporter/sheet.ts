// Builds the HTML that Puppeteer turns into a PDF. Pure code, no browser needed.
export type Layout = 'single' | 'A4' | 'A3';
const PAGES = { A4: [210, 297], A3: [297, 420] } as const;

export function buildSheetHtml(svgs: string[], layout: Layout, cw: number, ch: number, marks: boolean) {
  let pw = cw, ph = ch, perPage = 1, cols = 1, gap = 0, ox = 0, oy = 0;
  if (layout !== 'single') {
    [pw, ph] = PAGES[layout];
    const m = 10;
    gap = marks ? 8 : 4;
    cols = Math.max(1, Math.floor((pw - 2 * m + gap) / (cw + gap)));
    const rows = Math.max(1, Math.floor((ph - 2 * m + gap) / (ch + gap)));
    perPage = cols * rows;
    ox = (pw - (cols * cw + (cols - 1) * gap)) / 2;
    oy = (ph - (rows * ch + (rows - 1) * gap)) / 2;
  }
  const pages: string[] = [];
  for (let s = 0; s < svgs.length; s += perPage) {
    let cards = '', lines = '';
    svgs.slice(s, s + perPage).forEach((svg, i) => {
      const x = ox + (i % cols) * (cw + gap), y = oy + Math.floor(i / cols) * (ch + gap);
      cards += `<div class="card" style="left:${x}mm;top:${y}mm">${svg}</div>`;
      if (marks && layout !== 'single') {
        const t = (x1: number, y1: number, x2: number, y2: number) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
        for (const cx of [x, x + cw]) for (const [a, b] of [[y - 3.5, y - 1], [y + ch + 1, y + ch + 3.5]]) lines += t(cx, a, cx, b);
        for (const cy of [y, y + ch]) for (const [a, b] of [[x - 3.5, x - 1], [x + cw + 1, x + cw + 3.5]]) lines += t(a, cy, b, cy);
      }
    });
    pages.push(`<div class="page">${cards}<svg class="marks" width="${pw}mm" height="${ph}mm" viewBox="0 0 ${pw} ${ph}" stroke="#000" stroke-width=".15">${lines}</svg></div>`);
  }
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@page{size:${pw}mm ${ph}mm;margin:0}html,body{margin:0;padding:0}
.page{position:relative;width:${pw}mm;height:${ph}mm;overflow:hidden;break-after:page}
.page:last-child{break-after:auto}
.card{position:absolute;width:${cw}mm;height:${ch}mm}.card svg{display:block;width:100%;height:100%}
.marks{position:absolute;left:0;top:0}
</style></head><body>${pages.join('')}</body></html>`;
  return { html, pageW: pw, pageH: ph };
}