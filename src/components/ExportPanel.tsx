'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useStudio } from '@/lib/StudioContext';
import { renderCard } from '@/core/engine/render';
import { hydrateCard, generateBulkCards } from '@/core/engine/hydrate';
import { exportSvg } from '@/core/exporter/svg';
import { exportPng } from '@/core/exporter/png';
import { exportPdf } from '@/core/exporter/pdf';
import type { Layout } from '@/core/exporter/sheet';

const sel = 'rounded-lg border border-white/10 bg-neutral-900 px-3 py-1.5 text-sm';

export default function ExportPanel() {
  const { plan, people, person, info, isSample } = useStudio();
  const [format, setFormat] = useState<'pdf' | 'png' | 'svg'>('pdf');
  const [scope, setScope] = useState<'one' | 'all'>('all');
  const [dpi, setDpi] = useState(300);
  const [layout, setLayout] = useState<Layout>('single');
  const [marks, setMarks] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [err, setErr] = useState('');

  if (!plan) return null;

  const go = async () => {
    setBusy(true);
    setErr('');
    setProgress('');
    try {
      const list = scope === 'one' ? [person] : people;
      const templateSvg = typeof plan === 'string'
        ? plan
        : (plan as any)?.svg || renderCard(plan as any, person, info, 'export_base');

      setProgress(`Hydrating ${list.length} card${list.length > 1 ? 's' : ''} from template…`);
      const generated = generateBulkCards(templateSvg, list, info);
      const svgs = generated.map((g) => g.svg);

      if (format === 'pdf') {
        setProgress('Generating PDF sheets with Puppeteer…');
        const filename = scope === 'one' ? `${person.id || 'id-card'}` : `${info.name ? info.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'acm'}-badges`;
        await exportPdf(svgs, layout, plan.size || { w: 54, h: 86 }, marks, filename);
      } else if (format === 'svg') {
        for (let i = 0; i < list.length; i++) {
          setProgress(`Downloading SVG ${i + 1}/${list.length} (${list[i].id})…`);
          exportSvg(svgs[i], list[i].id || `card_${i + 1}`);
          if (list.length > 1) {
            await new Promise((r) => setTimeout(r, 200));
          }
        }
      } else {
        // PNG export
        for (let i = 0; i < list.length; i++) {
          setProgress(`Rendering PNG ${i + 1}/${list.length} (${list[i].id}) at ${dpi} DPI…`);
          await exportPng(svgs[i], plan, dpi, list[i].id || `card_${i + 1}`);
          if (list.length > 1) {
            await new Promise((r) => setTimeout(r, 200));
          }
        }
      }
      setProgress(`Successfully exported ${list.length} card${list.length > 1 ? 's' : ''}!`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
      <div>
        <h2 className="text-lg font-semibold">Export Settings</h2>
        <p className="text-xs text-neutral-400">
          Bulk generates all badges using your chosen draft template and attendee details.
        </p>
      </div>

      {isSample && (
        <p className="text-xs text-amber-300">
          Note: Currently using sample people. If you have a custom attendee CSV, load it in Step 3.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div>
          <label className="mb-1 block text-xs text-neutral-400">Format</label>
          <select className={sel} value={format} onChange={(e) => setFormat(e.target.value as typeof format)}>
            <option value="pdf">PDF (Print-Ready)</option>
            <option value="png">PNG (Raster Image)</option>
            <option value="svg">SVG (Vector)</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-400">Export Scope</label>
          <select className={sel} value={scope} onChange={(e) => setScope(e.target.value as typeof scope)}>
            <option value="all">Everyone ({people.length} attendees)</option>
            <option value="one">Selected Person ({person.name})</option>
          </select>
        </div>

        {format === 'png' && (
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Resolution</label>
            <select className={sel} value={dpi} onChange={(e) => setDpi(+e.target.value)}>
              <option value={150}>150 DPI (Screen preview)</option>
              <option value={300}>300 DPI (Standard print)</option>
              <option value={600}>600 DPI (Ultra high-res)</option>
            </select>
          </div>
        )}

        {format === 'pdf' && (
          <>
            <div>
              <label className="mb-1 block text-xs text-neutral-400">Sheet Layout</label>
              <select className={sel} value={layout} onChange={(e) => setLayout(e.target.value as Layout)}>
                <option value="single">Single card per page (54×86mm)</option>
                <option value="A4">A4 Sheet (8 cards per sheet)</option>
                <option value="A3">A3 Sheet (18 cards per sheet)</option>
              </select>
            </div>
            {layout !== 'single' && (
              <div className="pt-5">
                <label className="flex items-center gap-1.5 text-sm text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marks}
                    onChange={(e) => setMarks(e.target.checked)}
                    className="accent-violet-600 rounded"
                  />
                  Crop marks
                </label>
              </div>
            )}
          </>
        )}
      </div>

      <div className="pt-2">
        <button
          onClick={go}
          disabled={busy}
          className="rounded-xl bg-violet-600 px-6 py-2.5 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-40"
        >
          {busy ? (progress || 'Exporting…') : `Export ${scope === 'all' ? `All (${people.length})` : 'Card'}`}
        </button>
      </div>

      {progress && !err && <p className="text-xs text-emerald-400">{progress}</p>}
      {err && <p className="text-xs text-red-400">{err}</p>}

      {/* Cross-Promotion: Make Certificates for this event */}
      <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-amber-200">Event finished? Create Certificates!</h3>
          <p className="text-xs text-amber-300/80 mt-0.5">
            Reuse the same event details to generate print-ready A4 Certificates of Excellence &amp; Participation.
          </p>
        </div>
        <Link
          href="/studio/certificate"
          className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-500 transition shadow-sm"
        >
          Create Certificates →
        </Link>
      </div>
    </div>
  );
}
