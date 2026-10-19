'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudio, Msg } from '@/lib/StudioContext';
import { missing } from '@/core/ai/intake';
import { FIELD_OPTIONS } from '@/lib/constants';
import { FieldKey } from '@/types';

const GREETING: Msg = { from: 'bot', text: 'Tell me what you need, for example: "AI / ML themed ID cards for our 24-hour hackathon on 18 October at SVNIT". I will ask for anything missing.' };
const IDEAS = ['AI / ML', 'Cybersecurity', 'Web Dev', 'Data Science', 'Cloud / DevOps', 'Open Source', 'Default / Academic', 'Minimal & clean'];

async function toDataUri(file: File, max = 500): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * k);
    c.height = Math.round(img.height * k);
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.88);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function Step1() {
  const { prompt, setPrompt, info, setInfo, msgs, setMsgs, generate, setPreviewPhoto } = useStudio();
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
    if (pending.key === 'fields') {
      merged.hasPhotos = (value as FieldKey[]).includes('photo');
    }
    if (pending.key === 'customPreviewPhoto' && value === false) {
      setPreviewPhoto('/people/img_3.jpg');
    }
    setInfo(merged); setText(''); setPicked([]);
    push({ from: 'user', text: label }, { from: 'bot', text: next(merged) });
  };

  const handlePreviewPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.match(/\.(jpe?g)$/i) && file.type !== 'image/jpeg') {
      push({ from: 'bot', text: 'Please select a valid .jpg or .jpeg photo.' });
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await toDataUri(file, 500);
      setPreviewPhoto(dataUrl);
      answer(dataUrl, `Uploaded ${file.name}`);
    } catch {
      push({ from: 'bot', text: 'Could not process that photo. Please try another JPG.' });
    } finally {
      setBusy(false);
    }
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
        {busy && (
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-violet-400">
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span>Analyzing event details…</span>
          </div>
        )}
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
        {pending?.kind === 'file' && (
          <div className="space-y-3 rounded-2xl border border-dashed border-violet-500/50 bg-violet-500/10 p-5 text-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <svg className="h-8 w-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium text-neutral-200">Upload a JPG photo for the preview badge</p>
              <p className="text-xs text-neutral-400">Accepted formats: .jpg, .jpeg</p>
              <label className="mt-2 cursor-pointer rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-colors">
                <span>Choose JPG File</span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,image/jpeg"
                  className="hidden"
                  onChange={handlePreviewPhotoUpload}
                />
              </label>
            </div>
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