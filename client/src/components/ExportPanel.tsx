'use client';
import { DesignPlan } from '@/types';
import { exportSvg } from '@/core/exporter/svg';
import { exportPng } from '@/core/exporter/png';

export default function ExportPanel({ svg, plan }: { svg: string; plan: DesignPlan }) {
  return (
    <div className="flex gap-2">
      <button onClick={() => exportSvg(svg)} className="rounded-lg border px-3 py-1 text-sm">SVG</button>
      <button onClick={() => exportPng(svg, plan, 300)} className="rounded-lg border px-3 py-1 text-sm">PNG 300 DPI</button>
    </div>
  );
}
