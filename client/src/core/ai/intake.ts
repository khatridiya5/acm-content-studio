// The "ask back" brain. Pure code, no AI. Anything undefined is still unknown.
import { EventInfo, FieldKey } from '@/types';
import { FIELD_OPTIONS } from '@/lib/constants';

export interface Question {
  key: 'name' | 'date' | 'venue' | 'tagline' | 'fields' | 'hasPhotos';
  q: string;
  kind: 'text' | 'multi' | 'yesno';
  optional?: boolean;
}

export const QUESTIONS: Question[] = [
  { key: 'name', q: 'What is the event name?', kind: 'text' },
  { key: 'date', q: 'When is it? (date or dates)', kind: 'text' },
  { key: 'venue', q: 'Where is it held (venue)?', kind: 'text' },
  { key: 'tagline', q: 'Do you have a tagline? Type it, or press Skip.', kind: 'text', optional: true },
  { key: 'fields', q: 'Which details should appear on each card?', kind: 'multi' },
  { key: 'hasPhotos', q: 'Will you upload photos for the people?', kind: 'yesno' },
];

export const missing = (info: EventInfo) => QUESTIONS.filter((q) => info[q.key] === undefined);

const VALID = FIELD_OPTIONS.map((f) => f.key);

// Adds what the AI found, but only if the user's own words contain it and it is still unknown.
export function mergeInfo(info: EventInfo, got: Record<string, unknown>, userText: string) {
  const next: EventInfo = { ...info };
  const found: string[] = [];
  const low = userText.toLowerCase();
  for (const k of ['name', 'date', 'venue', 'tagline'] as const) {
    const v = got[k];
    if (next[k] === undefined && typeof v === 'string' && v.trim() && low.includes(v.trim().toLowerCase())) {
      next[k] = v.trim();
      found.push(`${k === 'name' ? 'event name' : k}: ${v.trim()}`);
    }
  }
  if (next.fields === undefined && Array.isArray(got.fields)) {
    const f = got.fields.filter((x): x is FieldKey => VALID.includes(x as FieldKey));
    if (f.length) { next.fields = f; found.push(`fields: ${f.join(', ')}`); }
  }
  return { info: next, found };
}