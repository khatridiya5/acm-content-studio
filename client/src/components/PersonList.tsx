'use client';
import { useState } from 'react';
import { useStudio } from '@/lib/StudioContext';
import { renderCard } from '@/core/engine/render';
import { exportSvg } from '@/core/exporter/svg';
import { exportPng } from '@/core/exporter/png';
import { exportPdf } from '@/core/exporter/pdf';
import type { Layout } from '@/core/exporter/sheet';

const sel = 'rounded-lg border border-white/10 bg-neutral-900 px-3 py-1.5 text-sm';

export default function ExportPanel() {
  const { plan, people, person, info, isSample } = useStudio();
  const [format, setFormat] = useState<'pdf' | 'png' | 'svg'>('pdf');
  const [scope, setScope] = useState<'one' | 'all'>('one');
  const [dpi, setDpi] = useState(300);
  const [layout, setLayout] = useState<Layout>('single');
  const [marks, setMarks] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  if (!plan) return null;

  const go = async () => {
    setBusy(true); setErr('');
    try {
      const list = scope === 'one' ? [person] : people;
      const svgs = list.map((p, i) => renderCard(plan, p, info, 's' + i));
      if (format === 'pdf') await exportPdf(svgs, layout, plan.size, marks, scope === 'one' ? person.id : 'id-cards');
      else for (let i = 0; i < list.length; i++) {
        if (format === 'svg') exportSvg(svgs[i], list[i].id);
        else await exportPng(svgs[i], plan, dpi, list[i].id);
        await new Promise((r) => setTimeout(r, 300));
      }
    } catch (e) { setErr(e instanceof Error ? e.message : 'Export failed'); }
    setBusy(false);
  };

  return (
    <div className="space-y-3">
      {isSample && <p className="text-sm text-amber-300">These are sample people. Upload your CSV in step 2 before printing.</p>}
      <div className="flex flex-wrap gap-2">
        <select className={sel} value={format} onChange={(e) => setFormat(e.target.value as typeof format)}>
          <option value="pdf">PDF (print)</option><option value="png">PNG</option><option value="svg">SVG</option>
        </select>
        <select className={sel} value={scope} onChange={(e) => setScope(e.target.value as typeof scope)}>
          <option value="one">Selected person</option><option value="all">Everyone ({people.length})</option>
        </select>
        {format === 'png' && (
          <select className={sel} value={dpi} onChange={(e) => setDpi(+e.target.value)}>
            <option value={150}>150 DPI</option><option value={300}>300 DPI</option><option value={600}>600 DPI</option>
          </select>
        )}
        {format === 'pdf' && (
          <>
            <select className={sel} value={layout} onChange={(e) => setLayout(e.target.value as Layout)}>
              <option value="single">One card per page</option><option value="A4">A4 sheet</option><option value="A3">A3 sheet</option>
            </select>
            {layout !== 'single' && (
              <label className="flex items-center gap-1.5 text-sm text-neutral-300">
                <input type="checkbox" checked={marks} onChange={(e) => setMarks(e.target.checked)} /> Crop marks
              </label>
            )}
          </>
        )}
      </div>
      <button onClick={go} disabled={busy} className="rounded-xl bg-violet-600 px-5 py-2.5 font-semibold disabled:opacity-40">
        {busy ? 'Exporting…' : 'Export'}
      </button>
      {err && <p className="text-sm text-red-400">{err}</p>}
    </div>
  );
}