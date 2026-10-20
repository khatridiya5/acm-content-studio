'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudio } from '@/lib/StudioContext';
import { DEFAULT_SIGNATORIES } from '@/lib/constants';

const THEME_IDEAS = [
  'AI / ML',
  'Cybersecurity',
  'Web Dev',
  'Data Science',
  'Cloud / DevOps',
  'Open Source',
  'Default / Academic',
  'Minimal (Black & White)',
];

function formatInitialDate(raw?: string): string {
  if (!raw) {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) {
    return raw.trim();
  }
  const timestamp = Date.parse(raw);
  if (!isNaN(timestamp)) {
    return new Date(timestamp).toISOString().split('T')[0];
  }
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export default function CertificateStep1() {
  const { prompt, setPrompt, info, setInfo, generateCertificates } = useStudio();
  const router = useRouter();

  const [eventName, setEventName] = useState(info.name || '');
  const [eventDate, setEventDate] = useState(() => formatInitialDate(info.date));
  const [styleTheme, setStyleTheme] = useState(prompt || 'AI / ML');

  const signatories = info.signatories && info.signatories.length >= 2 ? info.signatories : DEFAULT_SIGNATORIES;
  const [sig1Name, setSig1Name] = useState(signatories[0].name);
  const [sig1Title, setSig1Title] = useState(signatories[0].title);
  const [sig1Sign, setSig1Sign] = useState<string | null>(signatories[0].signatureImage || null);

  const [sig2Name, setSig2Name] = useState(signatories[1].name);
  const [sig2Title, setSig2Title] = useState(signatories[1].title);
  const [sig2Sign, setSig2Sign] = useState<string | null>(signatories[1].signatureImage || null);

  const [generating, setGenerating] = useState(false);

  const hasSharedEvent = Boolean(info.name && info.name.trim());

  const handleSignatureUpload = (file: File, setter: (val: string | null) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) return;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 400;
        const maxH = 200;
        let w = img.width;
        let h = img.height;
        if (w > maxW || h > maxH) {
          const ratio = Math.min(maxW / w, maxH / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          setter(canvas.toDataURL('image/png'));
        } else {
          setter(src);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) return;

    setGenerating(true);
    const updatedInfo = {
      ...info,
      name: eventName.trim(),
      date: eventDate.trim() || undefined,
      signatories: [
        {
          name: sig1Name.trim() || DEFAULT_SIGNATORIES[0].name,
          title: sig1Title.trim() || DEFAULT_SIGNATORIES[0].title,
          signatureImage: sig1Sign,
        },
        {
          name: sig2Name.trim() || DEFAULT_SIGNATORIES[1].name,
          title: sig2Title.trim() || DEFAULT_SIGNATORIES[1].title,
          signatureImage: sig2Sign,
        },
      ],
    };

    setInfo(updatedInfo);
    setPrompt(styleTheme.trim());

    await generateCertificates(styleTheme.trim());
    setGenerating(false);
    router.push('/studio/certificate/drafts');
  };

  return (
    <section className="mx-auto max-w-3xl pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-amber-400">Step 1 of 4 • Certificate Studio</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Configure Event &amp; Signatures</h1>
        </div>
      </div>

      {hasSharedEvent && (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200 flex items-start gap-3">
          <span className="text-lg">✨</span>
          <div>
            <p className="font-semibold">Shared event data loaded!</p>
            <p className="text-xs text-amber-300/80 mt-0.5">
              Event title and dates were pre-filled from your ID badge session. Customize the signatories and design theme below.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleGenerate} className="mt-6 space-y-6">
        {/* Event Details */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
          <h2 className="text-base font-semibold text-neutral-200">1. Event Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Event Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Inception Hackathon 2026"
                required
                className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Event / Issue Date
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500 [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* Visual Theme */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
          <h2 className="text-base font-semibold text-neutral-200">2. Visual Theme &amp; Style</h2>
          <div className="flex flex-wrap gap-2">
            {THEME_IDEAS.map((theme) => (
              <button
                type="button"
                key={theme}
                onClick={() => setStyleTheme(theme)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  styleTheme === theme
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-semibold'
                    : 'border-white/10 text-neutral-300 hover:border-amber-500/50'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={styleTheme}
            onChange={(e) => setStyleTheme(e.target.value)}
            placeholder="Describe styling or choose a preset above..."
            className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-amber-500 mt-2"
          />
        </div>

        {/* Dual Signatories */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-neutral-200">3. Official Authority Signatories</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Dual signature lines placed on the bottom left and right of every certificate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Signatory 1 */}
            <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-4 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Left Signatory (Faculty Sponsor)</span>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={sig1Name}
                  onChange={(e) => setSig1Name(e.target.value)}
                  placeholder="e.g. Dr. Faculty Advisor"
                  className="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Designation / Title</label>
                <input
                  type="text"
                  value={sig1Title}
                  onChange={(e) => setSig1Title(e.target.value)}
                  placeholder="e.g. Faculty Sponsor, ACM SVNIT"
                  className="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Official Signature (Optional)</label>
                {sig1Sign ? (
                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-neutral-950 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-20 rounded bg-white flex items-center justify-center overflow-hidden p-0.5">
                        <img src={sig1Sign} alt="Left signature" className="max-h-full max-w-full object-contain" />
                      </div>
                      <span className="text-[11px] text-neutral-300">Signature uploaded</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSig1Sign(null)}
                      className="text-xs text-red-400 hover:text-red-300 transition"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-neutral-950/60 px-3 py-2 text-xs text-neutral-400 cursor-pointer hover:border-amber-500/50 hover:text-amber-300 transition">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Upload sign (PNG / JPG)</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleSignatureUpload(f, setSig1Sign);
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Signatory 2 */}
            <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-4 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Right Signatory (Chapter Chair)</span>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={sig2Name}
                  onChange={(e) => setSig2Name(e.target.value)}
                  placeholder="e.g. Student Chapter Chair"
                  className="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Designation / Title</label>
                <input
                  type="text"
                  value={sig2Title}
                  onChange={(e) => setSig2Title(e.target.value)}
                  placeholder="e.g. Chairperson, ACM SVNIT"
                  className="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Official Signature (Optional)</label>
                {sig2Sign ? (
                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-neutral-950 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-20 rounded bg-white flex items-center justify-center overflow-hidden p-0.5">
                        <img src={sig2Sign} alt="Right signature" className="max-h-full max-w-full object-contain" />
                      </div>
                      <span className="text-[11px] text-neutral-300">Signature uploaded</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSig2Sign(null)}
                      className="text-xs text-red-400 hover:text-red-300 transition"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-neutral-950/60 px-3 py-2 text-xs text-neutral-400 cursor-pointer hover:border-amber-500/50 hover:text-amber-300 transition">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Upload sign (PNG / JPG)</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleSignatureUpload(f, setSig2Sign);
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!eventName.trim() || generating}
          className="w-full rounded-xl bg-amber-600 py-3.5 text-base font-semibold text-white transition hover:bg-amber-500 disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <span>Generating A4 Certificate Drafts…</span>
            </>
          ) : (
            <span>Generate Certificate Drafts →</span>
          )}
        </button>
      </form>
    </section>
  );
}
