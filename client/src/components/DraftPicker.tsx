'use client';
import { DesignPlan, EventInfo, Person } from '@/types';
import { renderCard } from '@/core/engine/render';
import { hydrateCard } from '@/core/engine/hydrate';
interface Props { plans: DesignPlan[]; selected: number; onSelect: (i: number) => void; person: Person; info: EventInfo }

export default function DraftPicker({ plans, selected, onSelect, person, info }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {plans.map((p, i) => {
        const rawSvg = typeof p === 'string' ? p : (p as any)?.svg || renderCard(p as any, person, info, 'd' + i);
        const svgContent = hydrateCard(rawSvg, person, info);
        return (
          <button key={i} onClick={() => onSelect(i)} className={`rounded-lg border p-1 text-xs ${i === selected ? 'border-violet-600 ring-1 ring-violet-600' : 'border-white/10'}`}>
            <div className="[&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: svgContent }} />
            Draft {i + 1}
          </button>
        );
      })}
    </div>
  );
}