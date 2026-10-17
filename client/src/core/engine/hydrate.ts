import { Person, EventInfo } from '@/types';
import { qrMatrix } from '@/core/data/qr';
import { QR_BASE } from '@/lib/constants';

// Escape XML special characters so text doesn't break SVG syntax.
export function escapeXml(value: unknown = ''): string {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  }[char] || char));
}

// Adjust font size dynamically for long names to prevent overflow.
export function fitFont(text: string, base = 4.6, maxChars = 18): number {
  return text.length <= maxChars ? base : Math.max(2.8, (base * maxChars) / text.length);
}

// Generate inline SVG QR code as a data URI for {{qr}} replacement.
export function generateQrDataUri(value: string, size = 64): string {
  const q = qrMatrix(value);
  const u = size / q.size;
  let d = '';
  for (let r = 0; r < q.size; r++) {
    for (let c = 0; c < q.size; c++) {
      if (q.dark(r, c)) {
        d += `M${(c * u).toFixed(3)} ${(r * u).toFixed(3)}h${u.toFixed(3)}v${u.toFixed(3)}h${(-u).toFixed(3)}z`;
      }
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="#fff"/><path d="${d}" fill="#111" shape-rendering="crispEdges"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Hydrates an SVG template with a person's data and event details.
 * Replaces placeholders: {{name}}, {{position}}, {{role}}, {{roll_no}}, {{id}},
 * {{department}}, {{year}}, {{event}}, {{date}}, {{venue}}, {{tagline}}, {{photo}}, and {{qr}}.
 */
export function hydrateCard(
  templateSvg: string,
  person: Person,
  info?: EventInfo,
  options: { defaultPhoto?: string } = {}
): string {
  let svg = templateSvg;
  const name = String(person.name ?? '').trim();
  const fallbackPhoto = options.defaultPhoto || info?.previewPhoto || '/people/img_3.jpg';
  const photo = (person.photo && person.photo.trim()) ? person.photo.trim() : fallbackPhoto;

  // Dynamically scale font-size for name
  const nameFontRegex = /font-size="([0-9.]+)"([^>]*>[^<]*\{\{name\}\})/i;
  const match = svg.match(nameFontRegex);
  if (match) {
    const originalSize = parseFloat(match[1]) || 4.6;
    const newSize = fitFont(name, originalSize).toFixed(2);
    svg = svg.replace(nameFontRegex, `font-size="${newSize}"$2`);
  } else {
    svg = svg.replace('font-size="4.6"', `font-size="${fitFont(name).toFixed(2)}"`);
  }

  // Replace all text placeholders
  const replacements: Record<string, string> = {
    name: escapeXml(name),
    position: escapeXml(person.role || (person as any).position || ''),
    role: escapeXml(person.role || (person as any).position || ''),
    roll_no: escapeXml(person.id || (person as any).roll_no || ''),
    id: escapeXml(person.id || (person as any).roll_no || ''),
    department: escapeXml(person.department || (person as any).dept || ''),
    year: escapeXml(person.year || ''),
    event: escapeXml(info?.name || ''),
    event_name: escapeXml(info?.name || ''),
    date: escapeXml(info?.date || ''),
    venue: escapeXml(info?.venue || ''),
    tagline: escapeXml(info?.tagline || ''),
  };

  for (const [key, val] of Object.entries(replacements)) {
    svg = svg.replaceAll(`{{${key}}}`, val);
  }

  // Replace photo placeholder
  svg = svg.replaceAll('{{photo}}', photo);

  // Replace QR placeholder if present
  if (svg.includes('{{qr}}')) {
    const roll = person.id || (person as any).roll_no || 'SVNIT';
    const qrVal = `${QR_BASE}?roll=${encodeURIComponent(roll)}`;
    const qrUri = generateQrDataUri(qrVal);
    svg = svg.replaceAll('{{qr}}', qrUri);
  }

  return svg;
}

/**
 * Bulk generates hydrated SVGs for all attendees based on the selected template.
 */
export function generateBulkCards(
  templateSvg: string,
  people: Person[],
  info?: EventInfo,
  options?: { defaultPhoto?: string }
): { person: Person; svg: string }[] {
  return people.map((p) => ({
    person: p,
    svg: hydrateCard(templateSvg, p, info, options),
  }));
}
