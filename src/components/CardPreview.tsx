'use client';
import { DesignPlan, Person } from '@/types';
import { renderCard } from '@/core/engine/render';

export default function CardPreview({ plan, person, event, width = 300 }: { plan: DesignPlan; person: Person; event: string; width?: number }) {
  return (
    <div style={{ width: `min(${width}px, 100%)` }}
      className="[&_svg]:h-auto [&_svg]:w-full [&_svg]:rounded-2xl [&_svg]:shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
      dangerouslySetInnerHTML={{ __html: renderCard(plan, person, event, 'p' + width) }} />
  );
}
