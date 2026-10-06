'use client';
// Step 3: pick one of the 3 drafts
import Link from 'next/link';
import { useStudio } from '@/lib/StudioContext';
import CardPreview from '@/components/CardPreview';
import Empty from '@/components/Empty';

export default function Step3() {
  const { plans, sel, setSel, person, event } = useStudio();
  if (!plans.length) return <Empty />;
  return (
    <section className="pt-6">
      <p className="text-sm text-violet-400">Step 3 of 4</p>
      <h1 className="mt-1 text-4xl font-bold tracking-tight">Pick a draft</h1>
      <p className="mt-3 text-neutral-400">Three different designs from your request. Click the one you like.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {plans.map((p, i) => (
          <button key={i} onClick={() => setSel(i)}
            className={`rounded-2xl border p-5 transition ${i === sel ? 'border-violet-500 bg-violet-500/10 ring-2 ring-violet-500' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
            <div className="flex justify-center"><CardPreview plan={p} person={person} event={event} width={200} /></div>
            <p className="mt-4 font-semibold">Draft {i + 1}</p>
            <p className="text-sm capitalize text-neutral-400">{p.style.replace('-', ' ')}</p>
          </button>
        ))}
      </div>

      <div className="mt-10 flex justify-between">
        <Link href="/studio/people" className="rounded-xl border border-white/10 px-5 py-3 hover:bg-white/5">← Back</Link>
        <Link href="/studio/export" className="rounded-xl bg-violet-600 px-6 py-3 font-semibold hover:bg-violet-500">Next: export →</Link>
      </div>
    </section>
  );
}
