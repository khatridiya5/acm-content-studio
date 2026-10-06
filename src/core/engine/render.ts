// Card drawer: design plan + person data -> SVG string.
// Text comes only from data. Missing photo -> initials. Nothing is invented.
import { DesignPlan, Person } from '@/types';
import { ROLE_COLORS } from '@/lib/constants';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

export function renderCard(plan: DesignPlan, person: Person, event: string, uid: string): string {
  const rc = ROLE_COLORS[person.role];
  const defs: string[] = [];
  let gi = 0;
  const fill = (f?: string) => {
    if (f === '$role') return rc;
    const m = /^gradient\((.+),(.+)\)$/.exec(f ?? '');
    if (m) {
      const id = `g${uid}_${gi++}`;
      defs.push(`<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${m[1]}"/><stop offset="1" stop-color="${m[2]}"/></linearGradient>`);
      return `url(#${id})`;
    }
    return f ?? 'none';
  };
  let out = '';
  for (const e of plan.elements) {
    if (e.type === 'rect') out += `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="${e.rx ?? 0}" fill="${fill(e.fill)}"/>`;
    else if (e.type === 'circle') out += `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${fill(e.fill)}" opacity="${e.opacity ?? 1}"/>`;
    else if (e.type === 'line') out += `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${e.stroke}" stroke-width=".4"/>`;
    else if (e.type === 'text') {
      const v = { name: person.name, role: person.role.toUpperCase(), id: person.id, event }[e.slot];
      if (!v) continue; // missing data: skip, never invent
      const size = e.maxW ? Math.min(e.size, e.maxW / (v.length * 0.56)) : e.size;
      out += `<text x="${e.x}" y="${e.y}" font-size="${size.toFixed(2)}" text-anchor="${e.anchor ?? 'start'}" font-weight="${e.weight ?? 400}" fill="${fill(e.fill)}" font-family="${esc(plan.font)}">${esc(v)}</text>`;
    } else if (e.type === 'image') {
      if (e.slot === 'photo') {
        const ini = person.name.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
        const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
        out += e.shape === 'circle'
          ? `<circle cx="${cx}" cy="${cy}" r="${e.w / 2}" fill="#fff" fill-opacity=".85" stroke="${rc}" stroke-width="1"/>`
          : `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="3" fill="#fff" fill-opacity=".85" stroke="${rc}" stroke-width="1"/>`;
        out += `<text x="${cx}" y="${cy + e.w * 0.14}" font-size="${e.w * 0.4}" text-anchor="middle" font-weight="700" fill="#333" font-family="Arial, sans-serif">${ini}</text>`;
      } else {
        // Placeholder. Replace with <image href="/brand/acm-logo.svg" preserveAspectRatio="xMidYMid meet" .../>
        const lab = e.slot === 'logo_acm' ? 'ACM NIT Surat' : 'SVNIT';
        out += `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="1" fill="#fff" fill-opacity=".9" stroke="#999" stroke-width=".2" stroke-dasharray=".8 .6"/><text x="${e.x + e.w / 2}" y="${e.y + e.h / 2 + 0.9}" font-size="2.4" text-anchor="middle" fill="#333" font-family="Arial, sans-serif">${lab}</text>`;
      }
    } else if (e.type === 'qr') {
      // Placeholder pattern. Swap for real QR via core/data/qr.ts
      let h = 0;
      for (const c of person.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
      const n = 9, u = e.w / n;
      out += `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" fill="#fff"/>`;
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        h = (h * 1103515245 + 12345) >>> 0;
        const fin = (r < 3 && (c < 3 || c >= n - 3)) || (r >= n - 3 && c < 3);
        if (fin || (h >> 16) & 1) out += `<rect x="${(e.x + c * u).toFixed(2)}" y="${(e.y + r * u).toFixed(2)}" width="${u.toFixed(2)}" height="${u.toFixed(2)}" fill="#111"/>`;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${plan.size.w}mm" height="${plan.size.h}mm" viewBox="0 0 ${plan.size.w} ${plan.size.h}"><defs>${defs.join('')}</defs>${out}</svg>`;
}
