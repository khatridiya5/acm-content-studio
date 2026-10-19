import { DesignPlan, Element, EventInfo, FieldKey } from '@/types';
import { THEMES, CARD_SIZE } from '@/lib/constants';

interface Pal { bg: string; ink: string; line: string; acc: string; roleInk: string }

function getContrastInk(hex: string): string {
  try {
    let s = hex.replace('#', '');
    if (s.length === 3) s = s.split('').map((c) => c + c).join('');
    const n = parseInt(s, 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const lin = (v: number) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const ratioWhite = (1.0 + 0.05) / (lum + 0.05);
    const ratioDark = (lum + 0.05) / (0.013 + 0.05);
    return ratioWhite >= ratioDark ? '#ffffff' : '#111111';
  } catch {
    return '#ffffff';
  }
}

const DEFAULT_THEME = 0; // Default / Academic theme

// A thin line drawn as a polygon, so it can have opacity (the 'line' element can't).
function seg(x1: number, y1: number, x2: number, y2: number, w: number, fill: string, opacity = 1): Element {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * (w / 2), ny = (dx / len) * (w / 2);
  return {
    type: 'poly',
    points: [x1 + nx, y1 + ny, x2 + nx, y2 + ny, x2 - nx, y2 - ny, x1 - nx, y1 - ny],
    fill, opacity,
  } as Element;
}

function decor(themeId: string, p: Pal): Element[] {
  const A = p.acc, out: Element[] = [];
  if (themeId === 'minimal') { // minimal: rings and dots
    out.push({ type: 'circle', cx: 54, cy: 86, r: 26, fill: 'none', stroke: A, sw: 0.3, opacity: 0.5 });
    out.push({ type: 'circle', cx: 54, cy: 86, r: 17, fill: 'none', stroke: A, sw: 0.3, opacity: 0.5 });
    out.push({ type: 'pattern', kind: 'dots', x: 0, y: 0, w: 22, h: 22, color: A, gap: 3, opacity: 0.35 });
  } else if (themeId === 'opensource') { // OPEN SOURCE / TERMINAL: matrix grid, pixel blocks, shell prompt ">"
    out.push({ type: 'pattern', kind: 'grid', x: 0, y: 0, w: 54, h: 86, color: A, gap: 5, opacity: 0.08 });
    for (const [x, y, o] of [[46, 20, 0.5], [49, 20, 0.28], [46, 23, 0.22], [3, 62, 0.3], [6, 62, 0.5], [3, 65, 0.2], [48, 67, 0.3], [45, 70, 0.45], [48, 70, 0.2]]) {
      out.push({ type: 'rect', x, y, w: 1.8, h: 1.8, rx: 0.3, fill: A, opacity: o });
    }
    out.push(seg(3, 32, 6.5, 34.5, 0.7, A, 0.55), seg(6.5, 34.5, 3, 37, 0.7, A, 0.55));
    out.push({ type: 'rect', x: 8, y: 36, w: 3, h: 0.8, fill: A, opacity: 0.55 }); // underscore cursor
    out.push({ type: 'circle', cx: 54, cy: 86, r: 22, fill: 'none', stroke: A, sw: 0.25, opacity: 0.3 });
  } else if (themeId === 'cyber') { // CYBERSECURITY: neon slashes, corner cut, glow ring
    out.push({ type: 'poly', points: [54, 34, 54, 46, 30, 86, 20, 86], fill: A, opacity: 0.12 });
    out.push({ type: 'poly', points: [54, 52, 54, 58, 40, 86, 36, 86], fill: A, opacity: 0.3 });
    out.push({ type: 'poly', points: [0, 0, 18, 0, 0, 18], fill: A, opacity: 0.22 });
    out.push({ type: 'pattern', kind: 'diag', x: 0, y: 72, w: 54, h: 14, color: A, gap: 2, opacity: 0.1 });
    out.push({ type: 'circle', cx: 50, cy: 22, r: 7, fill: 'none', stroke: A, sw: 0.3, opacity: 0.6 });
    out.push({ type: 'circle', cx: 50, cy: 22, r: 4, fill: 'none', stroke: A, sw: 0.2, opacity: 0.4 });
  } else if (themeId === 'web') { // WEB DEV: code-line skeleton, gutter dots
    [[8, 0], [5, 3], [9, 6], [6, 9], [7, 12]].forEach(([w, dy], i) => {
      out.push({ type: 'rect', x: 43 + (i % 2) * 1.5, y: 30 + dy, w, h: 1.1, rx: 0.5, fill: A, opacity: i % 2 ? 0.2 : 0.35 });
    });
    out.push({ type: 'pattern', kind: 'dots', x: 0, y: 60, w: 20, h: 26, color: A, gap: 3, opacity: 0.25 });
    out.push({ type: 'rect', x: 0, y: 0, w: 54, h: 0.8, fill: A, opacity: 0.8 });
    out.push({ type: 'circle', cx: 54, cy: 86, r: 20, fill: A, opacity: 0.07 });
  } else if (themeId === 'data') { // DATA SCIENCE: analytics bar indicator & grid
    [[42, 14, 2.5], [45.5, 20, 2.5], [49, 10, 2.5], [52.5, 17, 2.5]].forEach(([x, h, w]) => {
      out.push({ type: 'rect', x, y: 86 - h - 12, w, h, rx: 0.6, fill: A, opacity: 0.25 });
    });
    out.push({ type: 'pattern', kind: 'grid', x: 0, y: 45, w: 54, h: 41, color: A, gap: 5, opacity: 0.08 });
    out.push({ type: 'circle', cx: 0, cy: 0, r: 18, fill: 'none', stroke: A, sw: 0.3, opacity: 0.4 });
  } else if (themeId === 'cloud') { // CLOUD / DEVOPS: infrastructure grid & orbital arcs
    out.push({ type: 'pattern', kind: 'grid', x: 0, y: 0, w: 54, h: 86, color: A, gap: 6, opacity: 0.07 });
    out.push({ type: 'circle', cx: 54, cy: 0, r: 28, fill: 'none', stroke: A, sw: 0.35, opacity: 0.4 });
    out.push({ type: 'circle', cx: 54, cy: 0, r: 18, fill: 'none', stroke: A, sw: 0.25, opacity: 0.3 });
    out.push({ type: 'circle', cx: 54, cy: 0, r: 8, fill: A, opacity: 0.1 });
  } else if (themeId === 'ai') { // AI / ML: nodes + edges on the right edge
    const N: [number, number][] = [[50, 26], [45, 34], [51, 42], [46, 50], [50, 58]];
    for (const [a, b] of [[0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [2, 4], [3, 4]]) {
      out.push(seg(N[a][0], N[a][1], N[b][0], N[b][1], 0.25, A, 0.5));
    }
    for (const [x, y] of N) {
      out.push({ type: 'circle', cx: x, cy: y, r: 2.2, fill: A, opacity: 0.18 });
      out.push({ type: 'circle', cx: x, cy: y, r: 0.9, fill: A, opacity: 0.9 });
    }
    out.push({ type: 'pattern', kind: 'dots', x: 0, y: 0, w: 54, h: 86, color: A, gap: 6, opacity: 0.12 });
    out.push({ type: 'circle', cx: 0, cy: 86, r: 24, fill: 'none', stroke: A, sw: 0.25, opacity: 0.35 });
  } else { // default: Default / Academic slanted band and stripes
    out.push({ type: 'pattern', kind: 'diag', x: 0, y: 0, w: 54, h: 30, color: A, gap: 3, opacity: 0.12 });
    out.push({ type: 'poly', points: [0, 62, 54, 48, 54, 86, 0, 86], fill: A, opacity: 0.14 });
    out.push({ type: 'circle', cx: 54, cy: 20, r: 12, fill: 'none', stroke: A, sw: 0.3, opacity: 0.5 });
  }
  return out;
}

function elementsToSvg(
  elements: Element[],
  thFont: string,
  uid: string,
  eventName: string,
  pal: Pal
): string {
  const defs: string[] = [];
  let gi = 0;

  const fillToSvg = (f?: string): string => {
    if (!f || f === 'none') return 'none';
    if (f === '$role') return pal.acc || '#38bdf8';
    const m = /^([vr]?)gradient\((#[0-9a-fA-F]{6}),(#[0-9a-fA-F]{6})\)$/.exec(f);
    if (m) {
      const id = `g${uid}_${gi++}`;
      const stops = `<stop offset="0%" stop-color="${m[2]}"/><stop offset="100%" stop-color="${m[3]}"/>`;
      if (m[1] === 'r') {
        defs.push(`<radialGradient id="${id}" cx="50%" cy="40%" r="70%">${stops}</radialGradient>`);
      } else if (m[1] === 'v') {
        defs.push(`<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops}</linearGradient>`);
      } else {
        defs.push(`<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">${stops}</linearGradient>`);
      }
      return `url(#${id})`;
    }
    return f;
  };

  let body = '';
  for (const e of elements) {
    if (e.type === 'rect') {
      body += `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="${e.rx ?? 0}" fill="${fillToSvg(e.fill)}" opacity="${e.opacity ?? 1}"${e.stroke ? ` stroke="${fillToSvg(e.stroke)}" stroke-width="${e.sw ?? 0.4}"` : ''}/>\n    `;
    } else if (e.type === 'circle') {
      body += `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${fillToSvg(e.fill)}" opacity="${e.opacity ?? 1}"${e.stroke ? ` stroke="${fillToSvg(e.stroke)}" stroke-width="${e.sw ?? 0.4}"` : ''}/>\n    `;
    } else if (e.type === 'line') {
      body += `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${fillToSvg(e.stroke)}" stroke-width=".4"/>\n    `;
    } else if (e.type === 'poly') {
      body += `<polygon points="${e.points.join(' ')}" fill="${fillToSvg(e.fill)}" opacity="${e.opacity ?? 1}"/>\n    `;
    } else if (e.type === 'pattern') {
      const g = e.gap ?? 3;
      const pid = `pt${uid}_${gi++}`;
      const c = fillToSvg(e.color);
      const inner = e.kind === 'dots'
        ? `<circle cx="${g / 2}" cy="${g / 2}" r="${(g * 0.15).toFixed(2)}" fill="${c}"/>`
        : e.kind === 'grid'
          ? `<path d="M0 0H${g}M0 0V${g}" stroke="${c}" stroke-width=".2" fill="none"/>`
          : `<rect width="${g}" height="${(g / 2).toFixed(2)}" fill="${c}"/>`;
      defs.push(`<pattern id="${pid}" width="${g}" height="${g}" patternUnits="userSpaceOnUse"${e.kind === 'diag' ? ' patternTransform="rotate(45)"' : ''}>${inner}</pattern>`);
      body += `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" fill="url(#${pid})" opacity="${e.opacity ?? 0.3}"/>\n    `;
    } else if (e.type === 'image') {
      if (e.slot === 'logo_acm') {
        body += `<image x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" preserveAspectRatio="xMidYMid meet" xlink:href="/brand/acm_logo.png"/>\n    `;
      } else if (e.slot === 'logo_svnit') {
        body += `<image x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" preserveAspectRatio="xMidYMid meet" xlink:href="/brand/svnit_logo.jpg"/>\n    `;
      } else if (e.slot === 'photo') {
        const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
        const photoClipId = `photoClip_${uid}`;
        if (e.shape === 'circle') {
          defs.push(`<clipPath id="${photoClipId}"><circle cx="${cx}" cy="${cy}" r="${e.w / 2}"/></clipPath>`);
          body += `<circle cx="${cx}" cy="${cy}" r="${e.w / 2 + 0.5}" fill="none" stroke="${pal.acc}" stroke-width="0.8"/>\n    `;
          body += `<circle cx="${cx}" cy="${cy}" r="${e.w / 2}" fill="#64748b"/>\n    `;
          body += `<image x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${photoClipId})" xlink:href="{{photo}}"/>\n    `;
        } else {
          defs.push(`<clipPath id="${photoClipId}"><rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="3" ry="3"/></clipPath>`);
          body += `<rect x="${e.x - 0.5}" y="${e.y - 0.5}" width="${e.w + 1}" height="${e.h + 1}" rx="3.5" ry="3.5" fill="none" stroke="${pal.acc}" stroke-width="0.8"/>\n    `;
          body += `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="3" ry="3" fill="#64748b"/>\n    `;
          body += `<image x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${photoClipId})" xlink:href="{{photo}}"/>\n    `;
        }
      }
    } else if (e.type === 'qr') {
      body += `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="1" fill="#ffffff" opacity="0.95"/>\n    `;
      body += `<image x="${e.x + 0.5}" y="${e.y + 0.5}" width="${e.w - 1}" height="${e.h - 1}" preserveAspectRatio="xMidYMid meet" xlink:href="{{qr}}"/>\n    `;
    } else if (e.type === 'text') {
      let content = '';
      if (e.slot === 'event') content = eventName;
      else if (e.slot === 'name') content = '{{name}}';
      else if (e.slot === 'role') content = '{{position}}';
      else if (e.slot === 'id') content = '{{roll_no}}';
      else if (e.slot === 'department') content = '{{department}}';
      else if (e.slot === 'year') content = '{{year}}';

      if (content) {
        body += `<text x="${e.x}" y="${e.y}" font-family="${thFont}" font-size="${e.size}" font-weight="${e.weight ?? 400}"${e.maxW ? ` data-maxw="${e.maxW}"` : ''} text-anchor="${e.anchor ?? 'start'}" fill="${fillToSvg(e.fill)}">${content}</text>\n    `;
      }
    }
  }

  const cardClipId = `cardClip_${uid}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="54mm" height="86mm" viewBox="0 0 54 86">
  <defs>
    <clipPath id="${cardClipId}"><rect width="54" height="86" rx="3" ry="3"/></clipPath>
    ${defs.join('\n    ')}
  </defs>
  <g clip-path="url(#${cardClipId})">
    ${body.trim()}
  </g>
</svg>`;
}

export function makePlans(text: string = '', info: EventInfo = {}): DesignPlan[] {
  const t = (text || '').toLowerCase();
  let ti = THEMES.findIndex((h) => h.k.some((w) => t.includes(w)));
  if (ti < 0) ti = DEFAULT_THEME;
  const th = THEMES[ti] || THEMES[DEFAULT_THEME];
  const tech = th.id !== 'default' && th.id !== 'minimal';
  const [c1, c2] = th.bg, L = th.line, I = th.ink;
  const light = c1 === '#ffffff';
  const roleInk = getContrastInk(L);
  const pals: Pal[] = [
    { bg: `gradient(${c1},${c2})`, ink: I, line: L, acc: L, roleInk },
    // Middle card: always a mid-light, cool-grey shade (darker than white, lighter than dark)
    { bg: 'vgradient(#dde1e8,#bcc3cf)', ink: '#111827', line: '#475569', acc: L, roleInk },
    { bg: `rgradient(${c2},${c1})`, ink: I, line: L, acc: L, roleInk },
  ];
  const has = (k: FieldKey) => {
    if (k === 'photo' && info.hasPhotos === false) return false;
    return !info.fields || info.fields.includes(k);
  };
  const eventName = info.name || 'ACM Tech Event';
  const bgEl = (p: Pal): Element => ({ type: 'rect', x: 0, y: 0, w: 54, h: 86, fill: p.bg });

  // Tech polish: thin inner frame on top of everything + soft glow behind the photo.
  const frame = (): Element[] => tech
    ? [{ type: 'rect', x: 0.7, y: 0.7, w: 52.6, h: 84.6, rx: 2.5, fill: 'none', stroke: '$role', sw: 0.3, opacity: 0.45 }]
    : [];
  const glowCircle = (cx: number, cy: number, r: number): Element[] => tech
    ? [{ type: 'circle', cx, cy, r, fill: '$role', opacity: 0.16 },
    { type: 'circle', cx, cy, r: r - 1.5, fill: 'none', stroke: '$role', sw: 0.2, opacity: 0.4 }]
    : [];
  const glowRect = (x: number, y: number, w: number, h: number): Element[] => tech
    ? [{ type: 'rect', x: x - 1.8, y: y - 1.8, w: w + 3.6, h: h + 3.6, rx: 5, fill: '$role', opacity: 0.16 }]
    : [];

  // SAFE AREA: every detail (text, photo, QR, logos) stays >= 5mm from the card edge
  // => x in [5, 49], y in [5, 81]. Backgrounds, bands and decor may still bleed.
  const A = (p: Pal): Element[] => [bgEl(p), ...decor(th.id, p), { type: 'rect', x: 0, y: 0, w: 54, h: 17, fill: '$role' },
  { type: 'image', slot: 'logo_acm', x: 5, y: 2.75, w: 11.5, h: 11.5 }, { type: 'image', slot: 'logo_svnit', x: 37.5, y: 2.75, w: 11.5, h: 11.5 },
  { type: 'text', slot: 'event', x: 27, y: 23.5, size: 3.8, anchor: 'middle', maxW: 44, weight: 700, fill: p.ink },
  ...glowCircle(27, 38, 13),
  { type: 'image', slot: 'photo', x: 16, y: 27, w: 22, h: 22, shape: 'circle' },
  { type: 'text', slot: 'name', x: 27, y: 56, size: 4.2, maxW: 44, anchor: 'middle', weight: 700, fill: p.ink },
  { type: 'rect', x: 13, y: 59.8, w: 28, h: 5.6, rx: 2.8, fill: '$role' },
  { type: 'text', slot: 'role', x: 27, y: 63.8, size: 3, anchor: 'middle', weight: 700, fill: p.roleInk },
  { type: 'text', slot: 'id', x: 27, y: 69.2, size: 2.6, anchor: 'middle', maxW: 34, weight: 600, fill: p.ink },
  { type: 'text', slot: 'department', x: 27, y: 73.8, size: 2.4, anchor: 'middle', maxW: 34, fill: p.ink },
  { type: 'line', x1: 8, y1: 76.2, x2: 46, y2: 76.2, stroke: p.line },
  { type: 'text', slot: 'year', x: 6, y: 81, size: 2.4, anchor: 'start', maxW: 15, fill: p.ink },
  { type: 'qr', x: 23.25, y: 77.2, w: 7.5, h: 7.5, fill: p.ink },
  ...frame()];

  // SIDE-BAR (redesigned): wide accent rail, big photo + QR side by side,
  // right-shifted details. Dark, high-contrast palette.
  const B = (p: Pal): Element[] => [bgEl(p), ...decor(th.id, p),
  { type: 'rect', x: 0, y: 0, w: 6.5, h: 86, fill: '$role' },
  { type: 'image', slot: 'logo_acm', x: 9, y: 3.5, w: 11, h: 11 }, { type: 'image', slot: 'logo_svnit', x: 22, y: 3.5, w: 11, h: 11 },
  { type: 'text', slot: 'event', x: 9, y: 20, size: 3.8, anchor: 'start', maxW: 40, weight: 700, fill: p.ink },
  ...glowRect(9, 23.5, 26, 26),
  { type: 'image', slot: 'photo', x: 9, y: 23.5, w: 26, h: 26, shape: 'rounded' },
  { type: 'qr', x: 38, y: 23.5, w: 10.5, h: 10.5, fill: p.ink },
  { type: 'text', slot: 'year', x: 38, y: 38.5, size: 2.4, anchor: 'start', maxW: 11, fill: p.ink },
  { type: 'text', slot: 'id', x: 9, y: 55, size: 2.6, anchor: 'start', maxW: 26, weight: 600, fill: p.ink },
  { type: 'text', slot: 'name', x: 9, y: 61, size: 4.2, maxW: 40, anchor: 'start', weight: 700, fill: p.ink },
  { type: 'rect', x: 9, y: 64.5, w: 40, h: 5.8, rx: 1.5, fill: '$role' },
  { type: 'text', slot: 'role', x: 12, y: 68.7, size: 3, anchor: 'start', weight: 700, fill: p.roleInk },
  { type: 'text', slot: 'department', x: 9, y: 75, size: 2.4, anchor: 'start', maxW: 40, fill: p.ink },
  { type: 'line', x1: 9, y1: 77.5, x2: 49, y2: 77.5, stroke: p.line },
  ...frame()];

  const C = (p: Pal): Element[] => [bgEl(p), ...decor(th.id, p),
  { type: 'image', slot: 'logo_acm', x: 5, y: 3.5, w: 11.5, h: 11.5 }, { type: 'image', slot: 'logo_svnit', x: 37.5, y: 3.5, w: 11.5, h: 11.5 },
  { type: 'text', slot: 'event', x: 27, y: 20, size: 3.8, anchor: 'middle', maxW: 44, weight: 900, fill: p.ink },
  ...glowCircle(27, 35.5, 12.5),
  { type: 'image', slot: 'photo', x: 16, y: 24.5, w: 22, h: 22, shape: 'circle' },
  { type: 'text', slot: 'name', x: 27, y: 53, size: 4.4, maxW: 44, anchor: 'middle', weight: 700, fill: p.ink },
  { type: 'text', slot: 'department', x: 27, y: 59.5, size: 2.4, anchor: 'middle', maxW: 30, fill: p.ink },
  { type: 'text', slot: 'year', x: 27, y: 63.8, size: 2.4, anchor: 'middle', maxW: 30, fill: p.ink },
  { type: 'qr', x: 41, y: 55, w: 8, h: 8, fill: p.ink },
  { type: 'rect', x: 0, y: 66, w: 54, h: 20, fill: '$role' },
  { type: 'text', slot: 'role', x: 27, y: 74, size: 4.6, anchor: 'middle', maxW: 44, weight: 800, fill: p.roleInk },
  { type: 'text', slot: 'id', x: 27, y: 80, size: 2.6, anchor: 'middle', maxW: 44, fill: p.roleInk },
  ...frame()];

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
  const rawPlans = [A(pals[0]), B(pals[1]), C(pals[2])];

  return rawPlans.map((els, i) => {
    const filtered = els.filter(keep);
    const svg = elementsToSvg(filtered, th.font, `${th.id}_${i}`, eventName, pals[i]);
    return {
      style: names[i],
      font: th.font,
      size: CARD_SIZE,
      elements: filtered,
      svg,
    };
  });
}

/**
 * Call this AFTER you replace {{name}}, {{department}}, etc. in the svg.
 * Any text tagged with data-maxw (the 5mm-safe width) is shrunk until it fits,
 * so long names never run past the safe area.
 *   const finalSvg = fitSvgText(svg.replace('{{name}}', student.name) ...);
 */
export function fitSvgText(svg: string): string {
  return svg.replace(
    /<text([^>]*?)font-size="([\d.]+)"([^>]*?)data-maxw="([\d.]+)"([^>]*)>([^<]*)<\/text>/g,
    (m, a, size, b, maxW, c, content) => {
      const len = Math.max(1, String(content).trim().length);
      const est = len * parseFloat(size) * 0.62; // average glyph width ~0.62em (conservative)
      if (est <= parseFloat(maxW)) return m;
      const fitted = Math.max(1.6, (parseFloat(maxW) / (len * 0.62))).toFixed(2);
      return `<text${a}font-size="${fitted}"${b}data-maxw="${maxW}"${c}>${content}</text>`;
    }
  );
}