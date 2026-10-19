import { CertificateRecipient, EventInfo, Person } from '@/types';
import { qrMatrix } from '@/core/data/qr';
import { DEFAULT_SIGNATORIES, QR_BASE } from '@/lib/constants';
import { fitSvgText } from '@/core/ai/mock';

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
export function fitFont(text: string, base = 4.2, maxChars = 14): number {
  return text.length <= maxChars ? base : Math.max(2.6, (base * maxChars) / text.length);
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

export interface CertificatePhrasing {
  title: string;
  heading: string;
  subheading: string;
  presentation: string;
  citation: string;
}

/**
 * Automatically derives Certificate Title, Presentation Text, and Citation/Reason
 * strictly based on the recipient's role/award.
 */
export function getCertificatePhrasing(
  role: string,
  eventName: string = 'ACM Tech Event',
  team?: string
): CertificatePhrasing {
  const r = (role || '').trim();
  const low = r.toLowerCase();
  const event = eventName.trim() || 'the event';
  const teamText = team && team.trim() ? ` (Team: ${team.trim()})` : '';

  // 1. Winners / Ranks / Top positions
  if (/\b(?:1st|first|2nd|second|3rd|third|winner|champion|runner[_\s-]?up|rank|top|merit|gold|silver|bronze)\b/i.test(low)) {
    return {
      title: 'CERTIFICATE OF EXCELLENCE',
      heading: 'CERTIFICATE',
      subheading: 'OF EXCELLENCE',
      presentation: 'This certificate is proudly awarded to',
      citation: `for outstanding performance and securing ${r} in ${event}${teamText}.`,
    };
  }

  // 2. Organizing / Committee / Staff / Volunteers / Mentors
  if (/\b(?:organizer|organizing|executive|volunteer|managing|management|committee|mentor|coordinator|lead|speaker)\b/i.test(low)) {
    return {
      title: 'CERTIFICATE OF APPRECIATION',
      heading: 'CERTIFICATE',
      subheading: 'OF APPRECIATION',
      presentation: 'This certificate is gratefully presented to',
      citation: `in recognition of invaluable dedication and exemplary contribution as ${r} for ${event}.`,
    };
  }

  // 3. General Participation
  return {
    title: 'CERTIFICATE OF PARTICIPATION',
    heading: 'CERTIFICATE',
    subheading: 'OF PARTICIPATION',
    presentation: 'This certificate is proudly presented to',
    citation: `for active and successful participation in ${event}${teamText ? ` as part of Team ${team?.trim()}` : ''}.`,
  };
}

/**
 * Hydrates an SVG template with a person's data and event details.
 * Replaces placeholders: {{name}}, {{position}}, {{role}}, {{roll_no}}, {{id}},
 * {{department}}, {{year}}, {{event}}, {{date}}, {{venue}}, {{tagline}}, {{team}}, {{photo}}, and {{qr}}.
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

  // Strictly enforce team: only for participants
  const teamText = person.role === 'participant' && person.team ? person.team.trim() : '';

  // Replace all text placeholders
  const replacements: Record<string, string> = {
    name: escapeXml(name),
    position: escapeXml(person.role || (person as any).position || ''),
    role: escapeXml(person.role || (person as any).position || ''),
    roll_no: escapeXml(person.id || (person as any).roll_no || ''),
    id: escapeXml(person.id || (person as any).roll_no || ''),
    department: escapeXml(person.department || (person as any).dept || ''),
    year: escapeXml(person.year || ''),
    team: escapeXml(teamText),
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

  svg = fitSvgText(svg);
  return svg;
}

/**
 * Hydrates an SVG certificate template for an individual recipient.
 */
export function hydrateCertificate(
  templateSvg: string,
  recipient: CertificateRecipient,
  info?: EventInfo
): string {
  let svg = templateSvg;
  const name = String(recipient.name ?? '').trim();
  const eventName = info?.name || 'ACM Tech Event';
  const role = recipient.certificateRole || 'Participant';

  // Strict rule: if staff role, suppress team
  const isStaff = /\b(?:organizer|executive|volunteer|mentor|managing|committee|lead|coordinator)\b/i.test(role);
  const team = !isStaff && recipient.team ? recipient.team.trim() : '';

  const phrasing = getCertificatePhrasing(role, eventName, team);

  // Signatories
  const sig1 = info?.signatories?.[0] || DEFAULT_SIGNATORIES[0];
  const sig2 = info?.signatories?.[1] || DEFAULT_SIGNATORIES[1];

  // Adjust name font size for certificates (supports both mm scale ~10mm and px scale ~80px)
  const nameFontRegex = /font-size="([0-9.]+)"([^>]*>[^<]*\{\{name\}\})/i;
  const match = svg.match(nameFontRegex);
  if (match) {
    const originalSize = parseFloat(match[1]) || 10;
    const maxChars = originalSize > 30 ? 22 : 18;
    const newSize = fitFont(name, originalSize, maxChars).toFixed(2);
    svg = svg.replace(nameFontRegex, `font-size="${newSize}"$2`);
  }

  const TRANSPARENT_PIXEL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  const formatDisplayDate = (rawDate?: string): string => {
    if (!rawDate) return '2026';
    const trimmed = rawDate.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      try {
        const [year, month, day] = trimmed.split('-').map(Number);
        const d = new Date(year, month - 1, day);
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  };

  const replacements: Record<string, string> = {
    name: escapeXml(name),
    certificate_heading: escapeXml(phrasing.heading),
    certificate_subheading: escapeXml(phrasing.subheading),
    certificate_title: escapeXml(phrasing.heading),
    certificate_full_title: escapeXml(phrasing.title),
    certificate_type: escapeXml(phrasing.subheading),
    certificate_subtitle: escapeXml(phrasing.subheading),
    presentation_text: escapeXml(phrasing.presentation),
    citation: escapeXml(phrasing.citation),
    reason: escapeXml(phrasing.citation),
    certificate_role: escapeXml(role),
    role: escapeXml(role),
    position: escapeXml(role),
    team: escapeXml(team),
    roll_no: escapeXml(recipient.roll_no || ''),
    id: escapeXml(recipient.roll_no || ''),
    department: escapeXml(recipient.department || ''),
    event: escapeXml(eventName),
    event_name: escapeXml(eventName),
    date: escapeXml(formatDisplayDate(info?.date)),
    venue: escapeXml(info?.venue || ''),
    signatory_1: escapeXml(sig1.name),
    signatory_1_title: escapeXml(sig1.title),
    signature_1: sig1.signatureImage || TRANSPARENT_PIXEL,
    signatory_2: escapeXml(sig2.name),
    signatory_2_title: escapeXml(sig2.title),
    signature_2: sig2.signatureImage || TRANSPARENT_PIXEL,
  };

  for (const [key, val] of Object.entries(replacements)) {
    svg = svg.replaceAll(`{{${key}}}`, val);
  }

  // Replace QR if present
  if (svg.includes('{{qr}}')) {
    const identifier = recipient.roll_no || recipient.name || 'ACM-SVNIT';
    const qrVal = `${QR_BASE}?verify=${encodeURIComponent(identifier)}`;
    const qrUri = generateQrDataUri(qrVal, 96);
    svg = svg.replaceAll('{{qr}}', qrUri);
  }

  svg = fitSvgText(svg);
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

/**
 * Bulk generates hydrated SVGs for all certificate recipients based on the selected template.
 */
export function generateBulkCertificates(
  templateSvg: string,
  recipients: CertificateRecipient[],
  info?: EventInfo
): { recipient: CertificateRecipient; svg: string }[] {
  return recipients.map((r) => ({
    recipient: r,
    svg: hydrateCertificate(templateSvg, r, info),
  }));
}
