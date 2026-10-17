'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudio, Msg } from '@/lib/StudioContext';
import { missing } from '@/core/ai/intake';
import { FIELD_OPTIONS } from '@/lib/constants';
import { FieldKey } from '@/types';

const GREETING: Msg = { from: 'bot', text: 'Tell me what you need, for example: "Horror themed ID cards for our 24-hour hackathon on 18 October at SVNIT". I will ask for anything missing.' };
const IDEAS = ['Retro 80s arcade', 'Horror theme', 'Minimal and clean', 'Corporate blue', 'Nature and green', 'Festive and warm'];

export default function Step1() {
  const { prompt, setPrompt, info, setInfo, msgs, setMsgs, generate } = useStudio();
  const router = useRouter();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [picked, setPicked] = useState<FieldKey[]>([]);

  const pending = prompt ? missing(info)[0] : undefined;
  const push = (...m: Msg[]) => setMsgs((p) => [...p, ...m]);
  const next = (i: typeof info) => missing(i)[0]?.q ?? 'I have everything I need. You can generate the drafts now.';

  const sendFree = async () => {
    const t = text.trim();
    if (!t) return;
    setText(''); push({ from: 'user', text: t }); setBusy(true);
    try {
      const r = await fetch('/api/intake', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: t, info }) });
      const d = await r.json();
      setPrompt(prompt ? prompt + '\n' + t : t);
      const merged = d.info ?? info;
      setInfo(merged);
      push({ from: 'bot', text: (d.found?.length ? `I picked up: ${d.found.join('; ')}. ` : 'I did not find event details in that. ') + next(merged) });
    } catch { push({ from: 'bot', text: 'Something went wrong. Please try again.' }); }
    setBusy(false);
  };

  const answer = (value: unknown, label: string) => {
    if (!pending) return;
    const merged = { ...info, [pending.key]: value };
    setInfo(merged); setText(''); setPicked([]);
    push({ from: 'user', text: label }, { from: 'bot', text: next(merged) });
  };

  const go = async () => {
    setGenerating(true);
    await generate();
    setGenerating(false);
    router.push('/studio/drafts');
  };
  const ready = !!prompt && !pending;

  return (
    <section className="mx-auto max-w-2xl pt-6">
      <p className="text-sm text-violet-400">Step 1 of 4</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">What do you want to create?</h1>

      <div className="mt-5 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        {[GREETING, ...msgs].map((m, i) => (
          <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : ''}`}>
            <p className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${m.from === 'user' ? 'bg-violet-600' : 'bg-white/10'}`}>{m.text}</p>
          </div>
        ))}
        {busy && <p className="text-sm text-neutral-500">Reading…</p>}
      </div>

      {!prompt && (
        <div className="mt-3 flex flex-wrap gap-2">
          {IDEAS.map((t) => (
            <button key={t} onClick={() => setText(t + ' ID cards for our hackathon')}
              className="rounded-full border border-white/10 px-3 py-1 text-sm text-neutral-300 hover:border-violet-500">{t}</button>
          ))}
        </div>
      )}

      <div className="mt-4">
        {pending?.kind === 'multi' && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {FIELD_OPTIONS.map((f) => (
                <label key={f.key} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm">
                  <input type="checkbox" checked={picked.includes(f.key)}
                    onChange={() => setPicked((p) => (p.includes(f.key) ? p.filter((x) => x !== f.key) : [...p, f.key]))} /> {f.label}
                </label>
              ))}
            </div>
            <button disabled={!picked.length} onClick={() => answer(picked, picked.join(', '))}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold disabled:opacity-40">Confirm</button>
          </div>
        )}
        {pending?.kind === 'yesno' && (
          <div className="flex gap-2">
            <button onClick={() => answer(true, 'Yes')} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold">Yes</button>
            <button onClick={() => answer(false, 'No')} className="rounded-lg border border-white/10 px-4 py-2 text-sm">No</button>
          </div>
        )}
        {(!pending || pending.kind === 'text') && (
          <div className="flex gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') { if (pending) text.trim() && answer(text.trim(), text.trim()); else sendFree(); } }}
              placeholder={pending ? 'Type your answer…' : prompt ? 'Add more style notes (optional)…' : 'Describe your ID cards…'}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-violet-500" />
            {pending?.optional && (
              <button onClick={() => answer(null, 'Skip')} className="rounded-xl border border-white/10 px-4 text-sm">Skip</button>
            )}
            <button disabled={!text.trim() || busy} onClick={() => (pending ? answer(text.trim(), text.trim()) : sendFree())}
              className="rounded-xl bg-violet-600 px-5 font-semibold disabled:opacity-40">Send</button>
          </div>
        )}
      </div>

      <button onClick={go} disabled={!ready || generating}
        className="mt-6 w-full rounded-xl bg-violet-600 py-3.5 text-lg font-semibold hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40">
        {generating ? 'Generating drafts…' : 'Generate drafts →'}
      </button>
    </section>
  );
}