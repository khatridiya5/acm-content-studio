// Reads a people CSV or certificate recipients CSV. Never invents values: bad rows are reported.
import Papa from 'papaparse';
import { CertificateRecipient, FieldKey, Person, Role } from '@/types';

const ROLES: Role[] = ['participant', 'organizer', 'mentor', 'volunteer', 'executive'];
const ALIASES: Record<string, string> = {
  name: 'name', full_name: 'name',
  role: 'role', position: 'role',
  roll_no: 'id', rollno: 'id', roll: 'id', id: 'id', id_number: 'id', enrollment: 'id',
  department: 'department', dept: 'department', branch: 'department',
  year: 'year',
  photo: 'photo', image: 'photo', image_url: 'photo',
  team: 'team', team_name: 'team', teamname: 'team', group: 'team',
};

const CERT_ALIASES: Record<string, string> = {
  name: 'name', full_name: 'name', recipient_name: 'name', recipient: 'name',
  certificate_role: 'certificate_role', cert_role: 'certificate_role', award: 'certificate_role',
  role: 'certificate_role', position: 'certificate_role', achievement: 'certificate_role', category: 'certificate_role',
  roll_no: 'roll_no', rollno: 'roll_no', roll: 'roll_no', id: 'roll_no', id_number: 'roll_no', enrollment: 'roll_no',
  department: 'department', dept: 'department', branch: 'department',
  team: 'team', team_name: 'team', teamname: 'team', group: 'team',
};

export function parsePeople(text: string, need: FieldKey[] = [], hasPhotos = false) {
  const res = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => {
      const n = h.trim().toLowerCase().replace(/[\s-]+/g, '_');
      return ALIASES[n] ?? n;
    },
  });
  const people: Person[] = [];
  const photoRefs: (string | null)[] = [];
  const problems: string[] = [];
  const cols = res.meta.fields ?? [];

  // Compulsory columns: roll_no, name, department, role
  for (const c of ['name', 'role', 'id', 'department']) {
    if (!cols.includes(c)) {
      problems.push(`Compulsory column missing: ${c === 'id' ? 'roll_no' : c}`);
    }
  }

  // If card contains photo, photo column is also compulsory
  const photoRequired = hasPhotos || need.includes('photo');
  if (photoRequired && !cols.includes('photo')) {
    problems.push('Compulsory column missing: photo (required because cards contain photos)');
  }

  if (need.includes('year') && !cols.includes('year')) {
    problems.push('Column missing: year');
  }

  if (problems.length) return { people, photoRefs, problems };

  const seen = new Set<string>();
  res.data.forEach((row, i) => {
    const line = `Row ${i + 2}`;
    const role = (row.role ?? '').trim().toLowerCase() as Role;
    const id = (row.id ?? '').trim();
    const name = (row.name ?? '').trim();
    const department = (row.department ?? '').trim();
    const year = (row.year ?? '').trim();
    // Team is strictly only assigned if role is participant!
    const rawTeam = (row.team ?? '').trim();
    const team = role === 'participant' && rawTeam ? rawTeam : undefined;

    if (!name) return void problems.push(`${line}: name is empty`);
    if (!ROLES.includes(role)) return void problems.push(`${line} (${name}): unknown role "${row.role ?? ''}"`);
    if (!id) return void problems.push(`${line} (${name}): roll no is empty`);
    if (!department) return void problems.push(`${line} (${name}): department is empty`);
    if (seen.has(id.toLowerCase())) return void problems.push(`${line} (${name}): duplicate roll no ${id}`);
    if (need.includes('year') && !year) return void problems.push(`${line} (${name}): year is empty`);

    seen.add(id.toLowerCase());
    people.push({ name, role, id, department: department || undefined, year: year || undefined, photo: null, team });
    photoRefs.push((row.photo ?? '').trim() || null);
  });
  return { people, photoRefs, problems };
}

/**
 * Parses a dedicated Certificate Recipients CSV.
 * Compulsory: name, certificate_role (or award / position / role)
 * Optional: team (strictly participant/winner only), roll_no, department
 */
export function parseCertificateRecipients(text: string) {
  const res = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => {
      const n = h.trim().toLowerCase().replace(/[\s-]+/g, '_');
      return CERT_ALIASES[n] ?? n;
    },
  });
  const recipients: CertificateRecipient[] = [];
  const problems: string[] = [];
  const cols = res.meta.fields ?? [];

  if (!cols.includes('name')) {
    problems.push('Compulsory column missing: name (or full_name)');
  }
  if (!cols.includes('certificate_role')) {
    problems.push('Compulsory column missing: certificate_role (or award / role / position)');
  }

  if (problems.length) return { recipients, problems };

  const seen = new Set<string>();
  res.data.forEach((row, i) => {
    const line = `Row ${i + 2}`;
    const name = (row.name ?? '').trim();
    const certificateRole = (row.certificate_role ?? '').trim();
    const roll_no = (row.roll_no ?? '').trim() || undefined;
    const department = (row.department ?? '').trim() || undefined;
    const rawTeam = (row.team ?? '').trim();

    if (!name) return void problems.push(`${line}: name is empty`);
    if (!certificateRole) return void problems.push(`${line} (${name}): certificate role / award is empty`);

    // Strict rule: If role is organizer/executive/volunteer/committee, team MUST be suppressed
    const isStaffRole = /\b(?:organizer|executive|volunteer|mentor|managing|committee|lead|coordinator)\b/i.test(certificateRole);
    const team = !isStaffRole && rawTeam ? rawTeam : undefined;

    const dedupeKey = roll_no ? roll_no.toLowerCase() : name.toLowerCase();
    if (seen.has(dedupeKey)) {
      problems.push(`${line} (${name}): duplicate recipient ${roll_no ? `with roll no ${roll_no}` : ''}`);
      return;
    }
    seen.add(dedupeKey);

    recipients.push({
      name,
      certificateRole,
      team,
      roll_no,
      department,
    });
  });

  return { recipients, problems };
}