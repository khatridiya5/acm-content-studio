'use client';
import { useState } from 'react';
import { Person, Role } from '@/types';

const ROLES: Role[] = ['participant', 'organizer', 'mentor', 'volunteer', 'executive'];
const input = 'w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm';

const toDataUrl = (f: File) =>
  new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(f); });

export default function PersonEditor({ person, onSave, onAdd }: {
  person: Person; onSave: (p: Person) => void; onAdd: (p: Person) => void;
}) {
  const [d, setD] = useState<Person>(person);
  const set = (patch: Partial<Person>) => setD((x) => ({ ...x, ...patch }));

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-3">
      <h2 className="font-semibold">Edit / add person</h2>
      <div className="grid grid-cols-2 gap-3">
        <input className={input} placeholder="Name" value={d.name} onChange={(e) => set({ name: e.target.value })} />
        <input className={input} placeholder="Roll no" value={d.id} onChange={(e) => set({ id: e.target.value })} />
        <input className={input} placeholder="Department" value={d.department ?? ''} onChange={(e) => set({ department: e.target.value })} />
        <input className={input} placeholder="Year (optional)" value={d.year ?? ''} onChange={(e) => set({ year: e.target.value })} />
        <select className={input} value={d.role} onChange={(e) => set({ role: e.target.value as Role })}>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <input type="file" accept="image/png,image/jpeg,image/webp" className={input}
          onChange={async (e) => { const f = e.target.files?.[0]; if (f) set({ photo: await toDataUrl(f) }); }} />
      </div>
      <div className="flex gap-3">
        <button onClick={() => onSave(d)} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold">Save changes</button>
        <button onClick={() => onAdd({ ...d })} className="rounded-lg border border-neutral-700 px-4 py-2 text-sm">Add as new person</button>
      </div>
    </div>
  );
}