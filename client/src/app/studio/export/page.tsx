'use client';
// Step 4: download the card
import Link from 'next/link';
import { useStudio } from '@/lib/StudioContext';
import { renderCard } from '@/core/engine/render';
import { exportSvg } from '@/core/exporter/svg';
import { exportPng } from '@/core/exporter/png';
import CardPreview from '@/components/CardPreview';
import Empty from '@/components/Empty';

export default function Step4() {
  const { plan, person, event, people, pi, setPi } = useStudio();
  if (!plan) return <Empty />;
  const svg = renderCard(plan, person, event, 'x');
  return (
    <section className="pt-6">
      <p className="text-sm text-violet-400">Step 4 of 4</p>
      <h1 className="mt-1 text-4xl font-bold tracking-tight">Export your card</h1>
      <p className="mt-3 text-neutral-400">Download a sharp file you can print.</p>

      <div className="mt-8 grid items-start gap-10 md:grid-cols-2">
        <div className="justify-self-center"><CardPreview plan={plan} person={person} event={event} width={320} /></div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm">
            <p className="font-semibold">Summary</p>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-neutral-400">
              <dt>Event</dt><dd className="text-neutral-200">{event || 'Not set'}</dd>
              <dt>Design</dt><dd className="capitalize text-neutral-200">{plan.style.replace('-', ' ')}</dd>
              <dt>Card size</dt><dd className="text-neutral-200">{plan.size.w} × {plan.size.h} mm</dd>
            </dl>
          </div>
          <div>
            <label className="text-sm text-neutral-400">Check another role</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {people.map((p, i) => (
                <button key={p.id} onClick={() => setPi(i)} className={`rounded-full border px-3 py-1 text-sm capitalize ${i === pi ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 hover:border-white/30'}`}>{p.role}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => exportSvg(svg)} className="rounded-xl border border-white/10 py-3 font-semibold hover:bg-white/5">Download SVG</button>
            <button onClick={() => exportPng(svg, plan, 300)} className="rounded-xl bg-violet-600 py-3 font-semibold hover:bg-violet-500">Download PNG 300 DPI</button>
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-between">
        <Link href="/studio/drafts" className="rounded-xl border border-white/10 px-5 py-3 hover:bg-white/5">← Back</Link>
        <Link href="/studio" className="rounded-xl border border-white/10 px-5 py-3 hover:bg-white/5">Start over</Link>
      </div>
    </section>
  );
}