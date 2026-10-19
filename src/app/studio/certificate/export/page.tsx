'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStudio } from '@/lib/StudioContext';
import { generateBulkCertificates, hydrateCertificate } from '@/core/engine/hydrate';
import { exportPdf } from '@/core/exporter/pdf';
import { exportSvg } from '@/core/exporter/svg';
import { exportPng } from '@/core/exporter/png';
import { CERTIFICATE_SIZE } from '@/lib/constants';

const selStyle = 'rounded-lg border border-white/10 bg-neutral-900 px-3 py-1.5 text-sm text-white outline-none';

export default function CertificateStep4() {
  const {
    certPlan,
    certPlans,
    certRecipients,
    certRecipient,
    certPi,
    setCertPi,
    info,
    isCertSample,
  } = useStudio();
  const router = useRouter();

  const [format, setFormat] = useState<'pdf' | 'png' | 'svg'>('pdf');
  const [scope, setScope] = useState<'one' | 'all'>('all');
  const [dpi, setDpi] = useState(300);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [err, setErr] = useState('');

  if (!certPlan) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-neutral-400">No certificate design available.</p>
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

  const handleExport = async () => {
    setBusy(true);
    setErr('');
    setProgress('');
    try {
      const list = scope === 'one' ? [certRecipient] : certRecipients;
      setProgress(`Hydrating ${list.length} certificate${list.length > 1 ? 's' : ''}…`);
      const generated = generateBulkCertificates(rawActiveSvg, list, info);
      const svgs = generated.map((g) => g.svg);

      const baseName = info.name
        ? info.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : 'acm';

      if (format === 'pdf') {
        setProgress('Compiling print-ready A4 PDF certificates with Puppeteer…');
        const filename = scope === 'one'
          ? `certificate-${certRecipient.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
          : `${baseName}-certificates`;
        await exportPdf(svgs, 'single', CERTIFICATE_SIZE, false, filename);
      } else if (format === 'svg') {
        for (let i = 0; i < list.length; i++) {
          setProgress(`Downloading SVG ${i + 1}/${list.length} (${list[i].name})…`);
          const fname = `certificate_${list[i].name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
          exportSvg(svgs[i], fname);
          if (list.length > 1) {
            await new Promise((r) => setTimeout(r, 200));
          }
        }
      } else {
        // PNG export
        for (let i = 0; i < list.length; i++) {
          setProgress(`Rendering PNG ${i + 1}/${list.length} (${list[i].name}) at ${dpi} DPI…`);
          const fname = `certificate_${list[i].name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
          await exportPng(svgs[i], certPlan, dpi, fname);
          if (list.length > 1) {
            await new Promise((r) => setTimeout(r, 200));
          }
        }
      }

      setProgress(`Successfully exported ${list.length} certificate${list.length > 1 ? 's' : ''}!`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Certificate export failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-6 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-amber-400">Step 4 of 4 • Certificate Studio</p>
          <h1 className="text-3xl font-bold tracking-tight">Export Certificates</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Generate high-resolution print-ready A4 landscape certificates in bulk.
          </p>
        </div>
      </div>

      {isCertSample && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300">
          Note: Currently using sample recipients. To export real recipient certificates, upload a CSV in Step 3.
        </div>
      )}

      {/* Live Preview of Selected Recipient */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-neutral-400">
            <span className="font-semibold text-neutral-200">Active Preview:</span>{' '}
            <span className="text-amber-300 font-medium">{certRecipient.name}</span> •{' '}
            <span className="text-neutral-300">{certRecipient.certificateRole}</span>
          </div>

          {certRecipients.length > 1 && (
            <select
              value={certPi}
              onChange={(e) => setCertPi(+e.target.value)}
              className={selStyle}
            >
              {certRecipients.map((r, idx) => (
                <option key={idx} value={idx}>
                  {r.name} ({r.certificateRole})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-neutral-950 p-2 shadow-2xl">
          <div
            className="w-full aspect-[297/210] [&_svg]:h-auto [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: currentPreviewSvg }}
          />
        </div>
      </div>

      {/* Export Settings Panel */}
      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div>
          <h2 className="text-base font-semibold text-neutral-200">Export Settings</h2>
          <p className="text-xs text-neutral-400">
            Batch processes all {certRecipients.length} recipients with their individual titles and citations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Export Format</label>
            <select
              className={selStyle}
              value={format}
              onChange={(e) => setFormat(e.target.value as typeof format)}
            >
              <option value="pdf">PDF (Print-Ready A4 Landscape)</option>
              <option value="png">PNG (Raster Image)</option>
              <option value="svg">SVG (Scalable Vector)</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-neutral-400">Scope</label>
            <select
              className={selStyle}
              value={scope}
              onChange={(e) => setScope(e.target.value as typeof scope)}
            >
              <option value="all">Everyone ({certRecipients.length} recipients)</option>
              <option value="one">Only Selected ({certRecipient.name})</option>
            </select>
          </div>

          {format === 'png' && (
            <div>
              <label className="mb-1 block text-xs text-neutral-400">Resolution</label>
              <select
                className={selStyle}
                value={dpi}
                onChange={(e) => setDpi(+e.target.value)}
              >
                <option value={150}>150 DPI (Screen preview)</option>
                <option value={300}>300 DPI (Standard print)</option>
                <option value={600}>600 DPI (Ultra high-res)</option>
              </select>
            </div>
          )}
        </div>

        <div className="pt-2">
          <button
            onClick={handleExport}
            disabled={busy}
            className="rounded-xl bg-amber-600 px-6 py-3 font-semibold text-white transition hover:bg-amber-500 disabled:opacity-40 flex items-center gap-2"
          >
            {busy ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span>{progress || 'Exporting…'}</span>
              </>
            ) : (
              <span>
                Export {scope === 'all' ? `All (${certRecipients.length}) Certificates` : `Certificate for ${certRecipient.name}`}
              </span>
            )}
          </button>
        </div>

        {progress && !err && <p className="text-xs text-emerald-400">{progress}</p>}
        {err && <p className="text-xs text-red-400">{err}</p>}
      </div>

      {/* Cross-Promotion: Switch to ID Cards */}
      <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-violet-200">Need event badges too?</h3>
          <p className="text-xs text-violet-300/80 mt-0.5">
            Event details from this certificate session are already saved. You can generate print-ready ID cards immediately.
          </p>
        </div>
        <Link
          href="/studio"
          className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition"
        >
          Create ID Cards for {info.name || 'this event'} →
        </Link>
      </div>
    </section>
  );
}
