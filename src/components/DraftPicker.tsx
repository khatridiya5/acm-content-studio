'use client';
import { DesignPlan, Person } from '@/types';
import { renderCard } from '@/core/engine/render';
interface Props { plans: DesignPlan[]; selected: number; onSelect: (i: number) => void; person: Person; event: string; }

export default function DraftPicker({ plans, selected, onSelect, person, event }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {plans.map((p, i) => (
        <button key={i} onClick={() => onSelect(i)} className={`rounded-lg border p-1 text-xs ${i === selected ? 'border-violet-600 ring-1 ring-violet-600' : ''}`}>
          <div className="[&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: renderCard(p, person, event, 'd' + i) }} />
          Draft {i + 1}
        </button>
      ))}
    </div>
  );
}
