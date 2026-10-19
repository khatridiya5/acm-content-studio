'use client';
// Drag things on the card, resize, align, undo. Shows live warnings.
import { useRef, useState } from 'react';
import { DesignPlan, Element, EventInfo, Person } from '@/types';
import { renderCard } from '@/core/engine/render';
import { boxOf, labelOf } from '@/core/validator/bounds';
import { checkPlan } from '@/core/validator/check';

interface Props { plan: DesignPlan; person: Person; info: EventInfo; onChange: (p: DesignPlan) => void }
const snap = (n: number) => Math.round(n * 2) / 2;
const round = (n: number) => Math.round(n * 10) / 10;

function moveEl(e: Element, dx: number, dy: number): Element {
  switch (e.type) {
    case 'circle': return { ...e, cx: e.cx + dx, cy: e.cy + dy };
    case 'line': return { ...e, x1: e.x1 + dx, y1: e.y1 + dy, x2: e.x2 + dx, y2: e.y2 + dy };
    default: return { ...e, x: e.x + dx, y: e.y + dy };
  }
}
function scaleEl(e: Element, f: number): Element {
  if (e.type === 'text') return { ...e, size: round(e.size * f), maxW: e.maxW ? round(e.maxW * f) : undefined };
  if (e.type === 'image' || e.type === 'qr') return { ...e, w: round(e.w * f), h: round(e.h * f) };
  return e;
}
function alignEl(e: Element, mode: 'left' | 'center' | 'right', W: number): Element {
  if (e.type === 'image' || e.type === 'qr') return { ...e, x: mode === 'left' ? 3 : mode === 'center' ? round((W - e.w) / 2) : round(W - 3 - e.w) };
  if (e.type === 'text') return { ...e, anchor: mode === 'left' ? 'start' : mode === 'center' ? 'middle' : 'end', x: mode === 'left' ? 3 : mode === 'center' ? W / 2 : W - 3 };
  return e;
}

export default function CardEditor({ plan, person, info, onChange }: Props) {
  const [sel, setSel] = useState<number | null>(null);
  const [hist, setHist] = useState<DesignPlan[]>([]);
  const drag = useRef<{ i: number; sx: number; sy: number; orig: Element } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const { w: W, h: H } = plan.size;

  const remember = () => setHist((h) => [...h.slice(-29), plan]);
  const setEl = (i: number, el: Element) => onChange({ ...plan, elements: plan.elements.map((x, k) => (k === i ? el : x)) });
  const edit = (fn: (e: Element) => Element) => { if (sel === null) return; remember(); setEl(sel, fn(plan.elements[sel])); };
  const undo = () => { const p = hist[hist.length - 1]; if (!p) return; setHist((h) => h.slice(0, -1)); onChange(p); };

  const down = (i: number) => (ev: React.PointerEvent<SVGRectElement>) => {
    ev.preventDefault();
    ev.currentTarget.setPointerCapture(ev.pointerId);
    remember(); setSel(i);
    drag.current = { i, sx: ev.clientX, sy: ev.clientY, orig: plan.elements[i] };
  };
  const move = (ev: React.PointerEvent<SVGRectElement>) => {
    const d = drag.current;
    if (!d || !box.current) return;
    const k = W / box.current.getBoundingClientRect().width;
    setEl(d.i, moveEl(d.orig, snap((ev.clientX - d.sx) * k), snap((ev.clientY - d.sy) * k)));
  };
  const up = () => { drag.current = null; };

  const items = plan.elements.map((e, i) => ({ e, i, b: boxOf(e) })).filter((x) => x.b);
  const cur = sel !== null ? plan.elements[sel] : null;
  const issues = checkPlan(plan);

  return (
    <div className="space-y-3">
      <div ref={box} className="relative w-[300px] max-w-full touch-none select-none [&_svg]:h-auto [&_svg]:w-full [&_svg]:rounded-2xl">
        <div dangerouslySetInnerHTML={{ __html: renderCard(plan, person, info, 'ed') }} />
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${W} ${H}`}>
          {items.map(({ b, i }) => (
            <rect key={i} x={b!.x} y={b!.y} width={b!.w} height={b!.h} fill="transparent" pointerEvents="all"
              stroke={sel === i ? '#8b5cf6' : 'transparent'} strokeWidth={0.4} strokeDasharray="1 0.8"
              style={{ cursor: 'move', touchAction: 'none' }}
              onPointerDown={down(i)} onPointerMove={move} onPointerUp={up} />
          ))}
        </svg>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {items.map(({ e, i }) => (
          <button key={i} onClick={() => setSel(i)}
            className={`rounded-full border px-2.5 py-0.5 text-xs ${sel === i ? 'border-violet-500 text-white' : 'border-white/10 text-neutral-400'}`}>{labelOf(e)}</button>
        ))}
      </div>

      {cur && (cur.type === 'text' || cur.type === 'image' || cur.type === 'qr') && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <b className="mr-1">{labelOf(cur)}</b>
          <button onClick={() => edit((e) => scaleEl(e, 0.9))} className="rounded border border-white/10 px-2 py-1">Smaller</button>
          <button onClick={() => edit((e) => scaleEl(e, 1.1))} className="rounded border border-white/10 px-2 py-1">Bigger</button>
          <button onClick={() => edit((e) => alignEl(e, 'left', W))} className="rounded border border-white/10 px-2 py-1">Left</button>
          <button onClick={() => edit((e) => alignEl(e, 'center', W))} className="rounded border border-white/10 px-2 py-1">Center</button>
          <button onClick={() => edit((e) => alignEl(e, 'right', W))} className="rounded border border-white/10 px-2 py-1">Right</button>
          {(['x', 'y'] as const).map((k) => (
            <label key={k} className="flex items-center gap-1 text-neutral-400">{k}
              <input type="number" step="0.5" value={round(cur[k])} onChange={(ev) => edit((e) => ({ ...e, [k]: parseFloat(ev.target.value) || 0 }) as Element)}
                className="w-16 rounded border border-white/10 bg-transparent px-1 py-0.5 text-neutral-100" />
            </label>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3">
        <button onClick={undo} disabled={!hist.length} className="rounded border border-white/10 px-3 py-1 text-sm disabled:opacity-40">Undo</button>
        <span className="text-xs text-neutral-500">Drag items on the card, or pick one above.</span>
      </div>
      {issues.length > 0 && <ul className="list-disc pl-5 text-xs text-amber-300">{issues.map((m) => <li key={m}>{m}</li>)}</ul>}
    </div>
  );
}