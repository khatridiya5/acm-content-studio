// Reads a people CSV. Never invents values: bad rows are reported.
import Papa from 'papaparse';
import { FieldKey, Person, Role } from '@/types';

const ROLES: Role[] = ['participant', 'organizer', 'mentor', 'volunteer', 'executive'];
const ALIASES: Record<string, string> = {
  name: 'name', full_name: 'name',
  role: 'role', position: 'role',
  roll_no: 'id', rollno: 'id', roll: 'id', id: 'id', id_number: 'id', enrollment: 'id',
  department: 'department', dept: 'department', branch: 'department',
  year: 'year',
  photo: 'photo', image: 'photo', image_url: 'photo',
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

    if (!name) return void problems.push(`${line}: name is empty`);
    if (!ROLES.includes(role)) return void problems.push(`${line} (${name}): unknown role "${row.role ?? ''}"`);
    if (!id) return void problems.push(`${line} (${name}): roll no is empty`);
    if (!department) return void problems.push(`${line} (${name}): department is empty`);
    if (seen.has(id.toLowerCase())) return void problems.push(`${line} (${name}): duplicate roll no ${id}`);
    if (need.includes('year') && !year) return void problems.push(`${line} (${name}): year is empty`);

    seen.add(id.toLowerCase());
    people.push({ name, role, id, department: department || undefined, year: year || undefined, photo: null });
    photoRefs.push((row.photo ?? '').trim() || null);
  });
  return { people, photoRefs, problems };
}