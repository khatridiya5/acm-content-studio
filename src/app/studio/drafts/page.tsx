'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudio } from '@/lib/StudioContext';
import DraftPicker from '@/components/DraftPicker';
import CardEditor from '@/components/CardEditor';
import PersonList from '@/components/PersonList';

export default function Step3() {
  const { plans, plan, sel, setSel, person, people, pi, setPi, info, updatePlan, refine, loading, notice } = useStudio();
  const router = useRouter();
  const [cmd, setCmd] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!cmd.trim()) return;
    setBusy(true); setMsg('');
    const m = await refine(cmd.trim());
    setMsg(m || 'Done.'); if (!m) setCmd('');
    setBusy(false);
  };

  if (loading) return <p className="pt-10 text-neutral-400">Designing your cards…</p>;
  if (!plan) return (
    <p className="pt-10 text-neutral-400">No drafts yet. <button className="underline" onClick={() => router.push('/studio')}>Go back to step 1</button></p>
  );

  return (
    <section className="space-y-5 pt-6">
      <p className="text-sm text-violet-400">Step 2 of 4</p>
      <h1 className="text-3xl font-bold tracking-tight">Pick a draft and tweak it</h1>
      {notice && <p className="text-sm text-amber-300">{notice}</p>}
      <PersonList people={people} index={pi} onSelect={setPi} />
      <div className="grid gap-6 md:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <DraftPicker plans={plans} selected={sel} onSelect={setSel} person={person} info={info} />
          <div className="flex gap-2">
            <input value={cmd} onChange={(e) => setCmd(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run()}
              placeholder='e.g. "move the logos to the bottom" or "make it more minimal"'
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-violet-500" />
            <button onClick={run} disabled={busy} className="rounded-xl bg-violet-600 px-4 text-sm font-semibold disabled:opacity-40">{busy ? '…' : 'Apply'}</button>
          </div>
          {msg && <p className="text-sm text-neutral-400">{msg}</p>}
        </div>
        <CardEditor plan={plan} person={person} info={info} onChange={updatePlan} />
      </div>
      <button onClick={() => router.push('/studio/people')} className="w-full rounded-xl bg-violet-600 py-3.5 text-lg font-semibold hover:bg-violet-500">
        Continue to attendees →
      </button>
    </section>
  );
}