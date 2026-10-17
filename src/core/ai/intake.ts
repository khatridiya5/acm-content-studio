// The "ask back" brain. Pure code, no AI. Anything undefined is still unknown.
import { EventInfo, FieldKey } from '@/types';
import { FIELD_OPTIONS } from '@/lib/constants';

export interface Question {
  key: 'name' | 'date' | 'venue' | 'tagline' | 'fields' | 'customPreviewPhoto' | 'previewPhoto';
  q: string;
  kind: 'text' | 'multi' | 'yesno' | 'file';
  optional?: boolean;
}

export const missing = (info: EventInfo): Question[] => {
  const result: Question[] = [];
  if (info.name === undefined) result.push({ key: 'name', q: 'What is the event name?', kind: 'text' });
  if (info.date === undefined) result.push({ key: 'date', q: 'When is it? (date or dates)', kind: 'text' });
  if (info.venue === undefined) result.push({ key: 'venue', q: 'Where is it held (venue)?', kind: 'text' });
  if (info.tagline === undefined) result.push({ key: 'tagline', q: 'Do you have a tagline? Type it, or press Skip.', kind: 'text', optional: true });
  if (info.fields === undefined) {
    result.push({ key: 'fields', q: 'Which details should appear on each card?', kind: 'multi' });
  } else if (info.hasPhotos) {
    if (info.customPreviewPhoto === undefined) {
      result.push({ key: 'customPreviewPhoto', q: 'Will you upload photos for the people?', kind: 'yesno' });
    } else if (info.customPreviewPhoto === true && info.previewPhoto === undefined) {
      result.push({ key: 'previewPhoto', q: 'Please upload a sample JPG photo to use for card previews:', kind: 'file' });
    }
  }
  return result;
};

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
    if (f.length) {
      next.fields = f;
      next.hasPhotos = f.includes('photo');
      found.push(`fields: ${f.join(', ')}`);
    }
  }
  return { info: next, found };
}