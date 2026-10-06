'use client';
// Step 1: describe what you need
import { useRouter } from 'next/navigation';
import { useStudio } from '@/lib/StudioContext';

const IDEAS = ['Retro 80s arcade', 'Horror theme', 'Minimal and clean', 'Corporate blue', 'Nature and green', 'Festive and warm'];

export default function Step1() {
  const { prompt, setPrompt, event, setEvent, generate } = useStudio();
  const router = useRouter();
  const go = () => { generate(); router.push('/studio/people'); };

  return (
    <section className="mx-auto max-w-2xl pt-6">
      <p className="text-sm text-violet-400">Step 1 of 4</p>
      <h1 className="mt-1 text-4xl font-bold tracking-tight">What do you want to create?</h1>
      <p className="mt-3 text-neutral-400">Describe the ID cards in your own words. Mention a style, a mood, or a theme.</p>

      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5} autoFocus
        placeholder="e.g. Horror themed ID cards for our 24-hour hackathon"
        className="mt-6 w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-4 text-lg outline-none placeholder:text-neutral-600 focus:border-violet-500" />

      <div className="mt-3 flex flex-wrap gap-2">
        {IDEAS.map((t) => (
          <button key={t} onClick={() => setPrompt(t + ' ID cards for our hackathon')}
            className="rounded-full border border-white/10 px-3 py-1 text-sm text-neutral-300 hover:border-violet-500 hover:text-white">{t}</button>
        ))}
      </div>

      <label className="mt-8 block text-sm text-neutral-400">Event name (you provide it, nothing is invented)</label>
      <input value={event} onChange={(e) => setEvent(e.target.value)} placeholder="e.g. HackSVNIT 2026"
        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-neutral-600 focus:border-violet-500" />

      <button onClick={go} disabled={!prompt.trim()}
        className="mt-8 w-full rounded-xl bg-violet-600 py-3.5 text-lg font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40">
        Generate drafts →
      </button>
    </section>
  );
}
