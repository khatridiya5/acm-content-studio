// Reads a CSV (e.g. Google Forms export) with columns: name, role, id.
import Papa from 'papaparse';
import { Person, Role } from '@/types';

const ROLES: Role[] = ['participant', 'organizer', 'mentor', 'volunteer'];

export function parsePeople(text: string) {
  const res = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
  const people: Person[] = [];
  const problems: string[] = [];
  res.data.forEach((row, i) => {
    const role = (row.role ?? '').trim().toLowerCase() as Role;
    if (!row.name?.trim() || !ROLES.includes(role)) {
      problems.push(`Row ${i + 2}: missing name or unknown role`); // reported, never silently dropped
      return;
    }
    people.push({ name: row.name.trim(), role, id: row.id?.trim() || `ID-${i + 1}`, photo: row.photo || null });
  });
  return { people, problems };
}
