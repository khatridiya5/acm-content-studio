// Reads a people CSV. Never invents values: bad rows are reported.
import Papa from 'papaparse';
import { FieldKey, Person, Role } from '@/types';

const ROLES: Role[] = ['participant', 'organizer', 'mentor', 'volunteer'];
const ALIASES: Record<string, string> = {
  name: 'name', full_name: 'name',
  role: 'role', position: 'role',
  roll_no: 'id', rollno: 'id', roll: 'id', id: 'id', id_number: 'id', enrollment: 'id',
  department: 'department', dept: 'department', branch: 'department',
  year: 'year',
  photo: 'photo', image: 'photo', image_url: 'photo',
};

export function parsePeople(text: string, need: FieldKey[] = []) {
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
  for (const c of ['name', 'role', 'id']) {
    if (!cols.includes(c)) problems.push(`Column missing: ${c === 'id' ? 'roll_no' : c}`);
  }
  if (need.includes('department') && !cols.includes('department')) problems.push('Column missing: department');
  if (need.includes('year') && !cols.includes('year')) problems.push('Column missing: year');
  if (problems.length) return { people, photoRefs, problems };

  const seen = new Set<string>();
  res.data.forEach((row, i) => {
    const line = `Row ${i + 2}`;
    const role = (row.role ?? '').trim().toLowerCase() as Role;
    const id = (row.id ?? '').trim();
    const name = (row.name ?? '').trim();
    if (!name) return void problems.push(`${line}: name is empty`);
    if (!ROLES.includes(role)) return void problems.push(`${line} (${name}): unknown role "${row.role ?? ''}"`);
    if (!id) return void problems.push(`${line} (${name}): roll no is empty`);
    if (seen.has(id.toLowerCase())) return void problems.push(`${line} (${name}): roll no ${id} is repeated`);
    const department = (row.department ?? '').trim();
    const year = (row.year ?? '').trim();
    if (need.includes('department') && !department) return void problems.push(`${line} (${name}): department is empty`);
    if (need.includes('year') && !year) return void problems.push(`${line} (${name}): year is empty`);
    seen.add(id.toLowerCase());
    people.push({ name, role, id, department: department || undefined, year: year || undefined, photo: null });
    photoRefs.push((row.photo ?? '').trim() || null);
  });
  return { people, photoRefs, problems };
}