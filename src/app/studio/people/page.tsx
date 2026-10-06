'use client';
// Step 2: choose who to preview the card with
import Link from 'next/link';
import { useStudio } from '@/lib/StudioContext';
import { ROLE_COLORS } from '@/lib/constants';
import CardPreview from '@/components/CardPreview';
import Empty from '@/components/Empty';

export default function Step2() {
  const { plan, people, pi, setPi, name, setName, person, event } = useStudio();
  if (!plan) return <Empty />;
  return (
    <section className="pt-6">
      <p className="text-sm text-violet-400">Step 2 of 4</p>
      <h1 className="mt-1 text-4xl font-bold tracking-tight">Preview with a person</h1>
      <p className="mt-3 text-neutral-400">Each role gets its own color. Type a long name to test that the text fits.</p>

      <div className="mt-8 grid items-start gap-10 md:grid-cols-[1fr_auto]">
        <div className="space-y-6">
          <div>
            <label className="text-sm text-neutral-400">Role</label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {people.map((p, i) => (
                <button key={p.id} onClick={() => setPi(i)}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left capitalize transition ${i === pi ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
                  <span className="h-4 w-4 rounded-full" style={{ background: ROLE_COLORS[p.role] }} />{p.role}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-neutral-400">Name on the card</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-violet-500" />
          </div>
        </div>
        <div className="justify-self-center"><CardPreview plan={plan} person={person} event={event} width={260} /></div>
      </div>

      <div className="mt-10 flex justify-between">
        <Link href="/studio" className="rounded-xl border border-white/10 px-5 py-3 hover:bg-white/5">← Back</Link>
        <Link href="/studio/drafts" className="rounded-xl bg-violet-600 px-6 py-3 font-semibold hover:bg-violet-500">Next: pick a draft →</Link>
      </div>
    </section>
  );
}
