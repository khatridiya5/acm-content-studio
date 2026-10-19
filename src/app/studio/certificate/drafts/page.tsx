'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudio } from '@/lib/StudioContext';
import CertificateDraftPicker from '@/components/CertificateDraftPicker';
import { hydrateCertificate } from '@/core/engine/hydrate';

export default function CertificateStep2() {
  const {
    certPlans,
    certPlan,
    certSel,
    setCertSel,
    certRecipient,
    certRecipients,
    certPi,
    setCertPi,
    info,
    refineCert,
    loading,
    notice,
  } = useStudio();
  const router = useRouter();

  const [cmd, setCmd] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const runRefine = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cmd.trim() || busy) return;
    setBusy(true);
    setMsg('');
    const m = await refineCert(cmd.trim());
    setMsg(m || 'Refinement applied successfully.');
    if (!m) setCmd('');
    setBusy(false);
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="animate-spin h-8 w-8 text-amber-500 mx-auto border-2 border-current border-t-transparent rounded-full" />
        <p className="text-neutral-400">Crafting your certificate designs…</p>
      </div>
    );
  }

  if (!certPlan || !certPlans.length) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-neutral-400">No certificate drafts generated yet.</p>
        <button
          onClick={() => router.push('/studio/certificate')}
          className="text-amber-400 underline hover:text-amber-300"
        >
          Go back to Step 1
        </button>
      </div>
    );
  }

  const rawActiveSvg = typeof certPlan === 'string' ? certPlan : certPlan.svg || '';
  const currentPreviewSvg = hydrateCertificate(rawActiveSvg, certRecipient, info);

  return (
    <section className="space-y-6 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-amber-400">Step 2 of 4 • Certificate Studio</p>
          <h1 className="text-3xl font-bold tracking-tight">Pick a Design &amp; Refine</h1>
        </div>
      </div>

      {notice && <p className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl">{notice}</p>}

      {/* Recipient preview switcher */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-neutral-400">
          <span className="font-semibold text-neutral-200">Previewing as:</span>{' '}
          <span className="text-amber-300 font-medium">{certRecipient.name}</span>{' '}
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-neutral-300 ml-1">
            {certRecipient.certificateRole}
          </span>
          {certRecipient.team && (
            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300 ml-1">
              Team: {certRecipient.team}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-neutral-500">Test roles:</span>
          {certRecipients.slice(0, 4).map((r, idx) => (
            <button
              key={idx}
              onClick={() => setCertPi(idx)}
              className={`text-xs px-2.5 py-1 rounded-lg transition border ${
                idx === certPi
                  ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-semibold'
                  : 'border-white/10 bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              {r.certificateRole}
            </button>
          ))}
        </div>
      </div>

      {/* Drafts selector */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-300">Choose from 3 Design Directions:</h2>
        <CertificateDraftPicker
          plans={certPlans}
          selected={certSel}
          onSelect={setCertSel}
          recipient={certRecipient}
          info={info}
        />
      </div>

      {/* Main Full-Size Preview & Refiner */}
      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-200">Live A4 Landscape Preview</h2>
          <span className="text-xs text-neutral-400">297mm × 210mm • Print Vector SVG</span>
        </div>

        <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-neutral-950 p-2 shadow-2xl">
          <div
            className="w-full aspect-[297/210] [&_svg]:h-auto [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: currentPreviewSvg }}
          />
        </div>

        {/* AI Refiner Form */}
        <form onSubmit={runRefine} className="flex gap-2 pt-2">
          <input
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            placeholder='Ask AI to adjust styling, e.g. "make the border thicker" or "use navy background"'
            className="flex-1 rounded-xl border border-white/10 bg-neutral-900 px-4 py-2.5 text-sm outline-none focus:border-amber-500 text-white placeholder-neutral-500"
          />
          <button
            type="submit"
            disabled={busy || !cmd.trim()}
            className="rounded-xl bg-amber-600 px-5 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:opacity-40"
          >
            {busy ? 'Applying…' : 'Refine'}
          </button>
        </form>
        {msg && <p className="text-xs text-neutral-400">{msg}</p>}
      </div>

      <button
        onClick={() => router.push('/studio/certificate/recipients')}
        className="w-full rounded-xl bg-amber-600 py-3.5 text-lg font-semibold text-white transition hover:bg-amber-500"
      >
        Continue to Certificate Recipients CSV →
      </button>
    </section>
  );
}
