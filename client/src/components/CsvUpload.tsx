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

  const load = async () => {
    if (!csv) return;
    setBusy(true);
    const { people, photoRefs, problems } = parsePeople(await csv.text(), info.fields ?? []);
    const map = new Map(photos.map((f) => [base(f.name), f]));
    const n: string[] = [];
    for (let i = 0; i < people.length; i++) {
      const p = people[i];
      const f = map.get(base(photoRefs[i] ?? p.id));
      if (f) { try { p.photo = await toDataUri(f); } catch { n.push(`${p.name}: photo could not be read`); } }
      else if (info.hasPhotos) n.push(`${p.name} (${p.id}): no photo found, initials will be used`);
    }
    setProblems(problems); setNotes(n); setCount(people.length); setBusy(false);
    if (people.length) onLoaded(people);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div>
        <label className="block text-sm text-neutral-400">People CSV (columns: name, role, roll_no, department, year, photo optional)</label>
        <input type="file" accept=".csv" onChange={(e) => setCsv(e.target.files?.[0] ?? null)} className="mt-1 text-sm" />
      </div>
      <div>
        <label className="block text-sm text-neutral-400">Photos (optional). Name each file with the roll no, e.g. U25CS010.jpg</label>
        <input type="file" accept="image/*" multiple onChange={(e) => setPhotos(Array.from(e.target.files ?? []))} className="mt-1 text-sm" />
      </div>
      <button onClick={load} disabled={!csv || busy} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold disabled:opacity-40">
        {busy ? 'Reading…' : 'Load people'}
      </button>
      {count !== null && <p className="text-sm text-emerald-400">{count} people loaded.</p>}
      {problems.length > 0 && (
        <ul className="list-disc pl-5 text-sm text-red-400">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
      )}
      {notes.length > 0 && (
        <ul className="list-disc pl-5 text-sm text-amber-300">{notes.map((p) => <li key={p}>{p}</li>)}</ul>
      )}
    </div>
  );
}