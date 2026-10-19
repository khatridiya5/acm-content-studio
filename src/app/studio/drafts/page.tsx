'use client';
import { useStudio } from '@/lib/StudioContext';
import CardPreview from '@/components/CardPreview';
import ExportPanel from '@/components/ExportPanel';
import { checkPlan } from '@/core/validator/check';
import { renderCard } from '@/core/engine/render';       // NEW
import { exportPng } from '@/core/exporter/png';         // NEW

export default function Step4() {
  const { plan, person, info } = useStudio();
  if (!plan) return <p className="pt-10 text-neutral-400">Nothing to export yet. Create drafts first.</p>;
  const issues = typeof plan === 'object' && plan.elements ? checkPlan(plan) : [];
  return (
    <section className="space-y-5 pt-6">
      <p className="text-sm text-violet-400">Step 4 of 4</p>
      <h1 className="text-3xl font-bold tracking-tight">Export</h1>
      <div className="grid gap-8 md:grid-cols-[320px_1fr]">
        <CardPreview plan={plan} person={person} info={info} />
        <div className="space-y-4">
          {issues.length > 0 && <ul className="list-disc pl-5 text-sm text-amber-300">{issues.map((m) => <li key={m}>{m}</li>)}</ul>}

          {/* NEW: single-card download */}
          <button
            onClick={() => exportPng(renderCard(plan, person, info, 'one'), plan, 300, person.id)}
            className="rounded-lg border border-neutral-700 px-4 py-2 text-sm">
            Download this card only (PNG)
          </button>

          <ExportPanel />
        </div>
      </div>
    </section>
  );
}