'use client';
import { Person } from '@/types';
interface Props { people: Person[]; index: number; onSelect: (i: number) => void; name: string; setName: (v: string) => void; }

export default function PersonList({ people, index, onSelect, name, setName }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {people.map((p, i) => (
          <button key={p.id} onClick={() => onSelect(i)} className={`rounded-lg border px-3 py-1 text-sm ${i === index ? 'border-violet-600 ring-1 ring-violet-600' : ''}`}>{p.role}</button>
        ))}
      </div>
      <label className="block text-xs text-neutral-500">Name (test long names)</label>
      <input className="w-full rounded-lg border p-2 text-sm bg-transparent" value={name} onChange={(e) => setName(e.target.value)} />
    </div>
  );
}
