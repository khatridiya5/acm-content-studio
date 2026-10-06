'use client';
interface Props { prompt: string; setPrompt: (v: string) => void; event: string; setEvent: (v: string) => void; onGenerate: () => void; }

export default function PromptBox({ prompt, setPrompt, event, setEvent, onGenerate }: Props) {
  return (
    <div className="space-y-3">
      <label className="block text-xs text-neutral-500">What do you need?</label>
      <textarea className="w-full rounded-lg border p-2 text-sm bg-transparent" rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <label className="block text-xs text-neutral-500">Event name (you provide it)</label>
      <input className="w-full rounded-lg border p-2 text-sm bg-transparent" value={event} onChange={(e) => setEvent(e.target.value)} />
      <button onClick={onGenerate} className="w-full rounded-lg bg-violet-600 py-2 font-semibold text-white">Generate 3 drafts</button>
    </div>
  );
}
