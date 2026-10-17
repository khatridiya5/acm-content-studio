'use client';
// Drag SVG elements on the card, resize, align, and undo.
import { useRef, useState, useMemo } from 'react';
import { DesignPlan, EventInfo, Person } from '@/types';

interface Props { plan: DesignPlan; person: Person; info: EventInfo; onChange: (p: DesignPlan) => void }
interface SvgItem {
  id: string;
  type: 'text' | 'image';
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  b: { x: number; y: number; w: number; h: number };
  clipId?: string;
}

interface DragState {
  id: string;
  sx: number;
  sy: number;
  origX: number;
  origY: number;
  clipOrig?: {
    id: string;
    type: 'circle' | 'rect';
    origX: number;
    origY: number;
  };
}

const snap = (n: number) => Math.round(n * 2) / 2;
const round = (n: number) => Math.round(n * 10) / 10;

function parseSvgItems(svgString: string): { items: SvgItem[]; W: number; H: number } {
  if (typeof window === 'undefined' || !svgString) return { items: [], W: 54, H: 86 };
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    if (!svgEl) return { items: [], W: 54, H: 86 };

    let W = 54, H = 86;
    const vb = svgEl.getAttribute('viewBox');
    if (vb) {
      const parts = vb.trim().split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        W = parts[2]; H = parts[3];
      }
    }

    const items: SvgItem[] = [];

    // Parse text elements
    doc.querySelectorAll('text').forEach((el, idx) => {
      const text = el.textContent?.trim() || '';
      let label = text.slice(0, 16);
      if (text.includes('{{name}}')) label = 'Name';
      else if (text.includes('{{position}}') || text.includes('{{role}}')) label = 'Position';
      else if (text.includes('{{roll_no}}') || text.includes('{{id}}')) label = 'Roll No';
      else if (text.includes('{{department}}')) label = 'Department';
      else if (text.includes('{{year}}')) label = 'Year';
      else if (text.toLowerCase().includes('acm') || text.toLowerCase().includes('svnit')) label = 'Header';

      const x = parseFloat(el.getAttribute('x') || '0');
      const y = parseFloat(el.getAttribute('y') || '0');
      const size = parseFloat(el.getAttribute('font-size') || '3.5');
      const anchor = el.getAttribute('text-anchor') || 'start';
      const w = Math.max(size * text.length * 0.55, 8);
      const h = size * 1.2;
      const boxX = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
      const boxY = y - size * 0.9;

      items.push({ id: `text_${idx}`, type: 'text', label, x, y, w, h, b: { x: boxX, y: boxY, w, h } });
    });

    // Parse image elements
    doc.querySelectorAll('image').forEach((el, idx) => {
      const href = el.getAttribute('href') || el.getAttribute('xlink:href') || '';
      let label = 'Image';
      if (href.includes('acm_logo') || href.includes('__LOGO__')) label = 'ACM Logo';
      else if (href.includes('svnit_logo')) label = 'SVNIT Logo';
      else if (href.includes('{{photo}}') || href.includes('/people/') || href.startsWith('data:image')) label = 'Photo';
      else if (href.includes('{{qr}}')) label = 'QR Code';

      const x = parseFloat(el.getAttribute('x') || '0');
      const y = parseFloat(el.getAttribute('y') || '0');
      const w = parseFloat(el.getAttribute('width') || '10');
      const h = parseFloat(el.getAttribute('height') || '10');

      const clipAttr = el.getAttribute('clip-path') || '';
      const match = clipAttr.match(/#([a-zA-Z0-9_-]+)/);
      const clipId = match ? match[1] : undefined;

      items.push({ id: `image_${idx}`, type: 'image', label, x, y, w, h, b: { x, y, w, h }, clipId });
    });

    return { items, W, H };
  } catch {
    return { items: [], W: 54, H: 86 };
  }
}

function mutateSvg(
  svgString: string,
  itemId: string,
  fn: (el: SVGElement, doc: XMLDocument) => void
): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const [tag, idxStr] = itemId.split('_');
    const idx = parseInt(idxStr, 10);
    const elements = doc.querySelectorAll(tag);
    const target = elements[idx] as SVGElement;
    if (target) {
      fn(target, doc);
      return new XMLSerializer().serializeToString(doc.documentElement);
    }
    return svgString;
  } catch {
    return svgString;
  }
}

export default function CardEditor({ plan, person, onChange }: Props) {
  const currentSvg = typeof plan === 'string' ? plan : plan.svg || '';
  const photoUrl = person?.photo || '/people/img_3.jpg';
  const displaySvg = currentSvg.replace(/\{\{photo\}\}/g, photoUrl);
  const [selId, setSelId] = useState<string | null>(null);
  const [hist, setHist] = useState<string[]>([]);
  const drag = useRef<DragState | null>(null);
  const box = useRef<HTMLDivElement>(null);

  const { items, W, H } = useMemo(() => parseSvgItems(currentSvg), [currentSvg]);
  const cur = items.find((it) => it.id === selId) || null;

  const updatePlanWithSvg = (newSvg: string) => {
    if (typeof plan === 'string') {
      onChange({
        style: 'custom',
        font: 'Arial, Helvetica, sans-serif',
        size: { w: 54, h: 86 },
        elements: [],
        svg: newSvg,
      });
    } else {
      onChange({ ...plan, svg: newSvg });
    }
  };

  const remember = () => setHist((h) => [...h.slice(-29), currentSvg]);
  const undo = () => {
    const prev = hist[hist.length - 1];
    if (!prev) return;
    setHist((h) => h.slice(0, -1));
    updatePlanWithSvg(prev);
  };

  const applyMutation = (itemId: string, fn: (el: SVGElement, doc: XMLDocument) => void) => {
    remember();
    const newSvg = mutateSvg(currentSvg, itemId, fn);
    updatePlanWithSvg(newSvg);
  };

  const down = (item: SvgItem) => (ev: React.PointerEvent<SVGRectElement>) => {
    ev.preventDefault();
    ev.currentTarget.setPointerCapture(ev.pointerId);
    remember();
    setSelId(item.id);

    let clipOrig: DragState['clipOrig'];
    if (item.clipId && typeof window !== 'undefined') {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(currentSvg, 'image/svg+xml');
        const clipEl = doc.getElementById(item.clipId);
        if (clipEl) {
          const circle = clipEl.querySelector('circle');
          const rect = clipEl.querySelector('rect');
          if (circle) {
            clipOrig = {
              id: item.clipId,
              type: 'circle',
              origX: parseFloat(circle.getAttribute('cx') || '0'),
              origY: parseFloat(circle.getAttribute('cy') || '0'),
            };
          } else if (rect) {
            clipOrig = {
              id: item.clipId,
              type: 'rect',
              origX: parseFloat(rect.getAttribute('x') || '0'),
              origY: parseFloat(rect.getAttribute('y') || '0'),
            };
          }
        }
      } catch {}
    }

    drag.current = {
      id: item.id,
      sx: ev.clientX,
      sy: ev.clientY,
      origX: item.x,
      origY: item.y,
      clipOrig,
    };
  };

  const move = (ev: React.PointerEvent<SVGRectElement>) => {
    const d = drag.current;
    if (!d || !box.current) return;
    const k = W / box.current.getBoundingClientRect().width;
    const dx = snap((ev.clientX - d.sx) * k);
    const dy = snap((ev.clientY - d.sy) * k);
    const targetX = round(d.origX + dx);
    const targetY = round(d.origY + dy);

    const newSvg = mutateSvg(currentSvg, d.id, (el, doc) => {
      el.setAttribute('x', String(targetX));
      el.setAttribute('y', String(targetY));

      if (d.clipOrig) {
        const clipEl = doc.getElementById(d.clipOrig.id);
        if (clipEl) {
          if (d.clipOrig.type === 'circle') {
            const circle = clipEl.querySelector('circle');
            if (circle) {
              circle.setAttribute('cx', String(round(d.clipOrig.origX + dx)));
              circle.setAttribute('cy', String(round(d.clipOrig.origY + dy)));
            }
          } else if (d.clipOrig.type === 'rect') {
            const rect = clipEl.querySelector('rect');
            if (rect) {
              rect.setAttribute('x', String(round(d.clipOrig.origX + dx)));
              rect.setAttribute('y', String(round(d.clipOrig.origY + dy)));
            }
          }
        }
      }
    });
    updatePlanWithSvg(newSvg);
  };

  const up = (ev: React.PointerEvent<SVGRectElement>) => {
    try {
      if (ev.currentTarget.hasPointerCapture(ev.pointerId)) {
        ev.currentTarget.releasePointerCapture(ev.pointerId);
      }
    } catch {}
    drag.current = null;
  };

  const scaleCurrent = (factor: number) => {
    if (!cur) return;
    applyMutation(cur.id, (el, doc) => {
      if (cur.type === 'text') {
        const size = parseFloat(el.getAttribute('font-size') || '3.5');
        el.setAttribute('font-size', String(round(size * factor)));
      } else {
        const w = parseFloat(el.getAttribute('width') || '10');
        const h = parseFloat(el.getAttribute('height') || '10');
        el.setAttribute('width', String(round(w * factor)));
        el.setAttribute('height', String(round(h * factor)));

        if (cur.clipId) {
          const clipEl = doc.getElementById(cur.clipId);
          if (clipEl) {
            const circle = clipEl.querySelector('circle');
            if (circle) {
              const r = parseFloat(circle.getAttribute('r') || '0');
              circle.setAttribute('r', String(round(r * factor)));
            }
            const rect = clipEl.querySelector('rect');
            if (rect) {
              const rw = parseFloat(rect.getAttribute('width') || '0');
              const rh = parseFloat(rect.getAttribute('height') || '0');
              rect.setAttribute('width', String(round(rw * factor)));
              rect.setAttribute('height', String(round(rh * factor)));
            }
          }
        }
      }
    });
  };

  const alignCurrent = (mode: 'left' | 'center' | 'right') => {
    if (!cur) return;
    applyMutation(cur.id, (el, doc) => {
      if (cur.type === 'text') {
        if (mode === 'left') { el.setAttribute('x', '3'); el.setAttribute('text-anchor', 'start'); }
        else if (mode === 'center') { el.setAttribute('x', String(W / 2)); el.setAttribute('text-anchor', 'middle'); }
        else { el.setAttribute('x', String(W - 3)); el.setAttribute('text-anchor', 'end'); }
      } else {
        const w = parseFloat(el.getAttribute('width') || '10');
        let newX = 3;
        if (mode === 'left') newX = 3;
        else if (mode === 'center') newX = round((W - w) / 2);
        else newX = round(W - 3 - w);

        const oldX = parseFloat(el.getAttribute('x') || '0');
        const dx = newX - oldX;
        el.setAttribute('x', String(newX));

        if (cur.clipId && dx !== 0) {
          const clipEl = doc.getElementById(cur.clipId);
          if (clipEl) {
            const circle = clipEl.querySelector('circle');
            if (circle) {
              const cx = parseFloat(circle.getAttribute('cx') || '0');
              circle.setAttribute('cx', String(round(cx + dx)));
            }
            const rect = clipEl.querySelector('rect');
            if (rect) {
              const rx = parseFloat(rect.getAttribute('x') || '0');
              rect.setAttribute('x', String(round(rx + dx)));
            }
          }
        }
      }
    });
  };

  const setCoord = (axis: 'x' | 'y', val: number) => {
    if (!cur) return;
    applyMutation(cur.id, (el, doc) => {
      const oldVal = parseFloat(el.getAttribute(axis) || '0');
      const delta = round(val) - oldVal;
      el.setAttribute(axis, String(round(val)));

      if (cur.clipId && delta !== 0) {
        const clipEl = doc.getElementById(cur.clipId);
        if (clipEl) {
          const circle = clipEl.querySelector('circle');
          if (circle) {
            const attr = axis === 'x' ? 'cx' : 'cy';
            const cVal = parseFloat(circle.getAttribute(attr) || '0');
            circle.setAttribute(attr, String(round(cVal + delta)));
          }
          const rect = clipEl.querySelector('rect');
          if (rect) {
            const rVal = parseFloat(rect.getAttribute(axis) || '0');
            rect.setAttribute(axis, String(round(rVal + delta)));
          }
        }
      }
    });
  };

  return (
    <div className="space-y-3">
      <div ref={box} className="relative w-[300px] max-w-full touch-none select-none [&_svg]:h-auto [&_svg]:w-full [&_svg]:rounded-2xl shadow-xl">
        <div dangerouslySetInnerHTML={{ __html: displaySvg }} />
        <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox={`0 0 ${W} ${H}`}>
          {items.map((item) => (
            <rect key={item.id} x={item.b.x} y={item.b.y} width={item.b.w} height={item.b.h} fill="transparent" pointerEvents="all"
              stroke={selId === item.id ? '#8b5cf6' : 'transparent'} strokeWidth={0.5} strokeDasharray="1 0.8"
              style={{ cursor: 'move', touchAction: 'none' }}
              onPointerDown={down(item)} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
              onLostPointerCapture={() => { drag.current = null; }} />
          ))}
        </svg>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <button key={item.id} onClick={() => setSelId(item.id)}
            className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${selId === item.id ? 'border-violet-500 bg-violet-500/20 text-white font-medium' : 'border-white/10 text-neutral-400 hover:text-white'}`}>
            {item.label}
          </button>
        ))}
      </div>

      {cur && (
        <div className="flex flex-wrap items-center gap-2 text-sm pt-1">
          <b className="mr-1 text-violet-400">{cur.label}</b>
          <button onClick={() => scaleCurrent(0.9)} className="rounded border border-white/10 px-2 py-1 hover:bg-white/5">Smaller</button>
          <button onClick={() => scaleCurrent(1.1)} className="rounded border border-white/10 px-2 py-1 hover:bg-white/5">Bigger</button>
          <button onClick={() => alignCurrent('left')} className="rounded border border-white/10 px-2 py-1 hover:bg-white/5">Left</button>
          <button onClick={() => alignCurrent('center')} className="rounded border border-white/10 px-2 py-1 hover:bg-white/5">Center</button>
          <button onClick={() => alignCurrent('right')} className="rounded border border-white/10 px-2 py-1 hover:bg-white/5">Right</button>
          {(['x', 'y'] as const).map((k) => (
            <label key={k} className="flex items-center gap-1 text-neutral-400 text-xs">{k.toUpperCase()}
              <input type="number" step="0.5" value={round(cur[k])} onChange={(ev) => setCoord(k, parseFloat(ev.target.value) || 0)}
                className="w-16 rounded border border-white/10 bg-transparent px-1.5 py-0.5 text-neutral-100 text-xs" />
            </label>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button onClick={undo} disabled={!hist.length} className="rounded border border-white/10 px-3 py-1 text-xs disabled:opacity-40 hover:bg-white/5">
          Undo
        </button>
        <span className="text-xs text-neutral-500">Drag items on the card, or select one above.</span>
      </div>
    </div>
  );
}