'use client';
import { DesignPlan, EventInfo, Person } from '@/types';
import { renderCard } from '@/core/engine/render';

export default function CardPreview({ plan, person, info, width = 300 }: { plan: DesignPlan; person: Person; info: EventInfo; width?: number }) {
  const svg = typeof plan === 'string' ? plan : (plan as any)?.svg || renderCard(plan as any, person, info, 'p' + width);
  return (
    <div style={{ width: `min(${width}px, 100%)` }}
      className="[&_svg]:h-auto [&_svg]:w-full [&_svg]:rounded-2xl [&_svg]:shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
      dangerouslySetInnerHTML={{ __html: svg }} />
  );
}