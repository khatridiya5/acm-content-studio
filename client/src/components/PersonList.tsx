'use client';
import { Person } from '@/types';
import { ROLE_COLORS } from '@/lib/constants';

interface Props {
  people: Person[];
  index: number;
  onSelect: (i: number) => void;
}

export default function PersonList({ people, index, onSelect }: Props) {
  if (!people || people.length === 0) return null;

  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-300">
          Attendees ({people.length})
        </h2>
        <span className="text-xs text-neutral-400">Click a person to preview their card</span>
      </div>

      <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
        {people.map((p, i) => {
          const isSelected = i === index;
          const roleColor = ROLE_COLORS[p.role] || '#888888';
          const photoUrl = p.photo || '/people/img_3.jpg';

          return (
            <button
              key={`${p.id}_${i}`}
              onClick={() => onSelect(i)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                isSelected
                  ? 'border border-violet-500 bg-violet-500/10 text-white'
                  : 'border border-transparent bg-white/5 text-neutral-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={photoUrl}
                  alt={p.name}
                  className="h-8 w-8 rounded-full object-cover border border-white/10"
                  onError={(e) => {
                    // Fallback to default if error
                    (e.target as HTMLImageElement).src = '/people/img_3.jpg';
                  }}
                />
                <div className="truncate">
                  <p className="font-medium truncate">{p.name}</p>
                  <p className="text-xs text-neutral-400">
                    {p.id} {p.department ? `• ${p.department}` : ''}
                  </p>
                </div>
              </div>

              <span
                className="ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-black"
                style={{ backgroundColor: roleColor }}
              >
                {p.role}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}