// Card drawer: design plan + person + event info -> SVG string.
// Text comes only from data. Missing photo -> initials. Nothing is invented.
import { DesignPlan, EventInfo, Person, TextSlot } from '@/types';
import { QR_BASE, ROLE_COLORS } from '@/lib/constants';
import { LOGO_ACM, LOGO_SVNIT } from '@/core/brand/logos';
import { qrMatrix } from '@/core/data/qr';
import { fitText } from './fit';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
const r2 = (n: number) => +n.toFixed(2);

export function renderCard(plan: DesignPlan, person: Person, info: EventInfo, uid: string): string {
  const rc = ROLE_COLORS[person.role];
  const defs: string[] = [];
  let gi = 0, pi = 0;
  const fill = (f?: string): string => {
    if (f === '$role') return rc;
    if (f === 'none') return 'none';
    const m = /^([vr]?)gradient\((#[0-9a-fA-F]{6}),(#[0-9a-fA-F]{6})\)$/.exec(f ?? '');
    if (m) {
      const id = `g${uid}_${gi++}`;
      const stops = `<stop offset="0" stop-color="${m[2]}"/><stop offset="1" stop-color="${m[3]}"/>`;
      defs.push(m[1] === 'r'
        ? `<radialGradient id="${id}" cx=".5" cy=".4" r=".8">${stops}</radialGradient>`
        : `<linearGradient id="${id}" x1="0" y1="0" x2="${m[1] === 'v' ? 0 : 1}" y2="1">${stops}</linearGradient>`);
      return `url(#${id})`;
    }
    return /^#[0-9a-fA-F]{3,6}$/.test(f ?? '') ? (f as string) : 'none';
  };
  const stroke = (s?: string, w?: number) => (s ? ` stroke="${esc(fill(s))}" stroke-width="${w ?? 0.4}"` : '');
  const val: Record<TextSlot, string> = {
    name: person.name, role: person.role.toUpperCase(), id: person.id,
    event: info.name ?? '', department: person.department ?? '', year: person.year ?? '',
    date: info.date ?? '', venue: info.venue ?? '', tagline: info.tagline ?? '',
    team: (person.role === 'participant' ? person.team : '') ?? '',
  };
  const photo = person.photo && (/^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/.test(person.photo) || person.photo.startsWith('/') || person.photo.startsWith('http')) ? person.photo : null;
  const qrVal = `${QR_BASE}?roll=${encodeURIComponent(person.id)}`;

  let out = '';
  for (const e of plan.elements) {
    if (e.type === 'rect') out += `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="${e.rx ?? 0}" fill="${esc(fill(e.fill))}" opacity="${e.opacity ?? 1}"${stroke(e.stroke, e.sw)}/>`;
    else if (e.type === 'circle') out += `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${esc(fill(e.fill))}" opacity="${e.opacity ?? 1}"${stroke(e.stroke, e.sw)}/>`;
    else if (e.type === 'line') out += `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${esc(fill(e.stroke))}" stroke-width=".4"/>`;
    else if (e.type === 'poly') out += `<polygon points="${e.points.map((n) => r2(n)).join(' ')}" fill="${esc(fill(e.fill))}" opacity="${e.opacity ?? 1}"/>`;
    else if (e.type === 'pattern') {
      const g = e.gap ?? 3, id = `pt${uid}_${pi++}`, c = esc(fill(e.color));
      const inner = e.kind === 'dots' ? `<circle cx="${g / 2}" cy="${g / 2}" r="${(g * 0.14).toFixed(2)}" fill="${c}"/>`
        : e.kind === 'grid' ? `<path d="M0 0H${g}M0 0V${g}" stroke="${c}" stroke-width=".15" fill="none"/>`
        : `<rect width="${g}" height="${(g / 2).toFixed(2)}" fill="${c}"/>`;
      defs.push(`<pattern id="${id}" width="${g}" height="${g}" patternUnits="userSpaceOnUse"${e.kind === 'diag' ? ' patternTransform="rotate(45)"' : ''}>${inner}</pattern>`);
      out += `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" fill="url(#${id})" opacity="${e.opacity ?? 0.3}"/>`;
    }
    else if (e.type === 'text') {
      const raw = val[e.slot];
      if (!raw) continue; // missing data: skip, never invent
      const f = fitText(raw, e.size, e.maxW, e.slot === 'name' ? 3.2 : 2);
      out += `<text x="${e.x}" y="${e.y}" font-size="${f.size.toFixed(2)}" text-anchor="${e.anchor ?? 'start'}" font-weight="${e.weight ?? 400}" fill="${esc(fill(e.fill))}" font-family="${esc(plan.font)}">${esc(f.text)}</text>`;
    } else if (e.type === 'image') {
      if (e.slot === 'photo') {
        const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
        const shape = (extra: string) => e.shape === 'circle'
          ? `<circle cx="${cx}" cy="${cy}" r="${e.w / 2}" ${extra}/>`
          : `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="3" ${extra}/>`;
        if (photo) {
          const cid = `pc${uid}`;
          defs.push(`<clipPath id="${cid}">${e.shape === 'circle' ? `<circle cx="${cx}" cy="${cy}" r="${e.w / 2}"/>` : `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="3"/>`}</clipPath>`);
          out += `<image x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${cid})" xlink:href="${photo}"/>`;
          out += shape(`fill="none" stroke="${rc}" stroke-width="1"`);
        } else {
          const ini = person.name.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
          out += shape(`fill="#fff" fill-opacity=".85" stroke="${rc}" stroke-width="1"`);
          out += `<text x="${cx}" y="${cy + e.w * 0.14}" font-size="${e.w * 0.4}" text-anchor="middle" font-weight="700" fill="#333" font-family="Arial, sans-serif">${esc(ini)}</text>`;
        }
      } else {
        const src = e.slot === 'logo_acm' ? LOGO_ACM : LOGO_SVNIT;
        out += `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="1.5" fill="#fff"/>`;
        out += src
          ? `<image x="${r2(e.x + 0.6)}" y="${r2(e.y + 0.6)}" width="${r2(e.w - 1.2)}" height="${r2(e.h - 1.2)}" preserveAspectRatio="xMidYMid meet" xlink:href="${src}"/>`
          : `<text x="${e.x + e.w / 2}" y="${e.y + e.h / 2}" font-size="2" text-anchor="middle" fill="#c00" font-family="Arial, sans-serif">run make-logos</text>`;
      }
    } else if (e.type === 'qr') {
      const q = qrMatrix(qrVal);
      const s = Math.min(e.w, e.h), pad = s * 0.07, u = (s - 2 * pad) / q.size;
      let d = '';
      for (let r = 0; r < q.size; r++) for (let c = 0; c < q.size; c++)
        if (q.dark(r, c)) d += `M${(e.x + pad + c * u).toFixed(3)} ${(e.y + pad + r * u).toFixed(3)}h${u.toFixed(3)}v${u.toFixed(3)}h${(-u).toFixed(3)}z`;
      out += `<rect x="${e.x}" y="${e.y}" width="${s}" height="${s}" fill="#fff"/><path d="${d}" fill="#111" shape-rendering="crispEdges"/>`;
    }
  }
  const cc = `cc${uid}`;
  defs.push(`<clipPath id="${cc}"><rect width="${plan.size.w}" height="${plan.size.h}"/></clipPath>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${plan.size.w}mm" height="${plan.size.h}mm" viewBox="0 0 ${plan.size.w} ${plan.size.h}"><defs>${defs.join('')}</defs><g clip-path="url(#${cc})">${out}</g></svg>`;
}