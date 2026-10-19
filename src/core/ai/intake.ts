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

function cleanMarkdown(str: string): string {
  if (!str) return '';
  return str.replace(/\*\*/g, '').replace(/\*/g, '').trim();
}

// Fast heuristic extraction using regex patterns to parse prompt instantly in <1ms
export function extractHeuristicIntake(text: string): Record<string, unknown> {
  const result: Record<string, unknown> = {
    name: null,
    date: null,
    venue: null,
    tagline: null,
    fields: null,
  };

  const raw = text.trim();
  if (!raw) return result;

  // 1. Event name / Title extraction (supports labeled "**Event Title:** ...", "Title: ...", or natural sentences)
  const titleMatch = raw.match(/(?:\*{0,2}(?:event\s*(?:title|name)|title)\*{0,2}\s*[:\-–]\s*)([^\n\r]+)/i);
  if (titleMatch && titleMatch[1]) {
    result.name = cleanMarkdown(titleMatch[1]);
  } else {
    const eventMatch = raw.match(/\b(?:for\s+(?:our\s+|the\s+)?(?:annual\s+|upcoming\s+)?|named\s+|event\s+(?:called|named)?\s*)([A-Za-z0-9\s-]{3,40}?)(?=(?:\s+(?:on|at|in|with|having|dated)|[.,;]|$))/i);
    if (eventMatch && eventMatch[1]) {
      const ev = eventMatch[1].trim();
      if (!/^(?:cards?|id|badges?|conference|workshop)$/i.test(ev)) {
        result.name = ev;
      }
    }
  }

  // 2. Tagline / Theme extraction (supports labeled "**Theme:** ...", "Tagline: ...")
  const themeMatch = raw.match(/(?:\*{0,2}(?:theme|tagline|motto)\*{0,2}\s*[:\-–]\s*)([^\n\r]+)/i);
  if (themeMatch && themeMatch[1]) {
    result.tagline = cleanMarkdown(themeMatch[1]);
  }

  // 3. Date extraction (supports labeled "**Date:** November 15, 2026", Month First "Nov 15, 2026", Day First "18 Oct 2026", or "18/10/2026")
  const dateLabelMatch = raw.match(/(?:\*{0,2}date\*{0,2}\s*[:\-–]\s*)([^\n\r]+)/i);
  if (dateLabelMatch && dateLabelMatch[1]) {
    result.date = cleanMarkdown(dateLabelMatch[1]);
  } else {
    const monthFirstMatch = raw.match(/\b(?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*[-–to]+\s*\d{1,2}(?:st|nd|rd|th)?)?(?:,?\s+\d{4})?)\b/i);
    if (monthFirstMatch) {
      result.date = monthFirstMatch[0].trim();
    } else {
      const dayFirstMatch = raw.match(/\b(?:on\s+)?(\d{1,2}(?:st|nd|rd|th)?(?:\s*[-–to]+\s*\d{1,2}(?:st|nd|rd|th)?)?\s+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s+\d{4})?|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\b/i);
      if (dayFirstMatch) {
        result.date = dayFirstMatch[1].trim();
      }
    }
  }

  // 4. Venue extraction (supports labeled "**Venue:** Main Auditorium, ABC...", or "at SVNIT", "in Seminar Hall")
  const venueLabelMatch = raw.match(/(?:\*{0,2}(?:venue|location|place)\*{0,2}\s*[:\-–]\s*)([^\n\r]+)/i);
  if (venueLabelMatch && venueLabelMatch[1]) {
    result.venue = cleanMarkdown(venueLabelMatch[1]);
  } else {
    const venueInlineMatch = raw.match(/\b(?:at|in|venue:\s*)(?:\s+(?:the\s+)?)([A-Z0-9][A-Za-z0-9\s,&.-]{2,50}?)(?=(?:\s+(?:on|for|with|from|having|dated)|$))/i);
    if (venueInlineMatch && venueInlineMatch[1]) {
      const v = venueInlineMatch[1].trim();
      if (!/^\d|^(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(v)) {
        result.venue = v;
      }
    }
  }

  // 5. Fields extraction
  const low = raw.toLowerCase();
  const fields: FieldKey[] = [];
  if (/\b(?:name|names)\b/i.test(low)) fields.push('name');
  if (/\b(?:role|roles|designation|position)\b/i.test(low)) fields.push('role');
  if (/\b(?:roll|roll[_\s-]?no|registration|id)\b/i.test(low)) fields.push('roll');
  if (/\b(?:photo|photos|picture|pic|avatar|image)\b/i.test(low)) fields.push('photo');
  if (/\b(?:qr|qr[_\s-]?code|barcode)\b/i.test(low)) fields.push('qr');
  if (/\b(?:dept|department|branch)\b/i.test(low)) fields.push('department');
  if (/\b(?:year|batch|class)\b/i.test(low)) fields.push('year');

  if (fields.length >= 2) {
    result.fields = fields;
  }

  return result;
}

// Adds what the AI found, but only if the user's own words contain it and it is still unknown.
export function mergeInfo(info: EventInfo, got: Record<string, unknown>, userText: string) {
  const next: EventInfo = { ...info };
  const found: string[] = [];
  const low = userText.toLowerCase();
  for (const k of ['name', 'date', 'venue', 'tagline'] as const) {
    const v = got[k];
    if (next[k] === undefined && typeof v === 'string' && v.trim()) {
      const vTrim = v.trim();
      const vLow = vTrim.toLowerCase();
      const words = vLow.split(/\s+/).filter((w) => w.length > 2);
      const isPresent = low.includes(vLow) || (words.length > 0 && words.every((w) => low.includes(w)));
      if (isPresent) {
        next[k] = vTrim;
        found.push(`${k === 'name' ? 'event name' : k}: ${vTrim}`);
      }
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