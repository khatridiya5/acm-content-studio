'use client';
import { useState } from 'react';
import { parsePeople } from '@/core/data/csv';
import { EventInfo, Person } from '@/types';

const base = (s: string) => s.replace(/\\/g, '/').split('/').pop()!.replace(/\.[^.]+$/, '').toLowerCase();

async function toDataUri(file: File, max = 500) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.88);
  } finally { URL.revokeObjectURL(url); }
}

export default function CsvUpload({ info, onLoaded }: { info: EventInfo; onLoaded: (p: Person[]) => void }) {
  const [csv, setCsv] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [problems, setProblems] = useState<string[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const hasPhotos = info.hasPhotos ?? (info.fields ? info.fields.includes('photo') : false);
  const defaultPhoto = info.previewPhoto || '/people/img_3.jpg';

  const load = async () => {
    if (!csv) return;
    setBusy(true);
    const { people, photoRefs, problems } = parsePeople(await csv.text(), info.fields ?? [], hasPhotos);

    const map = new Map(photos.map((f) => [f.name.toLowerCase(), f]));
    const baseMap = new Map(photos.map((f) => [base(f.name), f]));
    const missing: string[] = [];

    for (let i = 0; i < people.length; i++) {
      const p = people[i];
      const ref = (photoRefs[i] ?? '').trim();
      let matchedFile: File | undefined;

      if (ref) {
        matchedFile = map.get(ref.toLowerCase()) || baseMap.get(base(ref));
      }
      if (!matchedFile) {
        matchedFile = map.get(`${p.id.toLowerCase()}.jpg`) ||
                      map.get(`${p.id.toLowerCase()}.jpeg`) ||
                      map.get(`${p.id.toLowerCase()}.png`) ||
                      baseMap.get(base(p.id));
      }

      if (matchedFile) {
        try {
          p.photo = await toDataUri(matchedFile);
        } catch {
          p.photo = defaultPhoto;
          missing.push(`Roll No ${p.id} (${p.name}): photo file could not be read, embedded default photo`);
        }
      } else if (ref && (ref.startsWith('data:image') || ref.startsWith('http://') || ref.startsWith('https://') || ref.startsWith('/'))) {
        p.photo = ref;
      } else {
        p.photo = defaultPhoto;
        if (hasPhotos) {
          missing.push(`Roll No ${p.id} (${p.name}): photo missing or not found (${ref || 'no filename'}), embedded default photo`);
        }
      }
    }

    setProblems(problems);
    setNotes(missing);
    setCount(people.length);
    setBusy(false);
    if (people.length && problems.length === 0) onLoaded(people);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div>
        <label className="block text-sm text-neutral-400">
          People CSV (Compulsory: <span className="text-violet-400 font-semibold">roll_no, name, department, role</span>
          {hasPhotos && <span className="text-amber-400 font-semibold">, photo</span>}
          . Optional: year)
        </label>
        <input type="file" accept=".csv" onChange={(e) => setCsv(e.target.files?.[0] ?? null)} className="mt-1 text-sm" />
      </div>
      <div>
        <label className="block text-sm text-neutral-400">
          Photos (optional). Upload images matching filenames in the CSV photo column, or named by roll no (e.g. U25CS010.jpg)
        </label>
        <input type="file" accept="image/*" multiple onChange={(e) => setPhotos(Array.from(e.target.files ?? []))} className="mt-1 text-sm" />
      </div>
      <button onClick={load} disabled={!csv || busy} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold disabled:opacity-40">
        {busy ? 'Reading…' : 'Load people'}
      </button>
      {count !== null && problems.length === 0 && <p className="text-sm text-emerald-400">{count} people loaded successfully.</p>}
      {problems.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-red-400">CSV Validation Errors:</p>
          <ul className="list-disc pl-5 text-sm text-red-400 max-h-48 overflow-y-auto">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
      )}
      {notes.length > 0 && (
        <div className="space-y-1 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
          <p className="text-xs font-semibold text-amber-400">Missing or Inaccessible Photos ({notes.length} attendees):</p>
          <ul className="list-disc pl-5 text-xs text-amber-300 max-h-40 overflow-y-auto">{notes.map((n) => <li key={n}>{n}</li>)}</ul>
        </div>
      )}
    </div>
  );
}