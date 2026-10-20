'use client';
import { CertificateRecipient, DesignPlan, EventInfo } from '@/types';
import { hydrateCertificate } from '@/core/engine/hydrate';

interface Props {
  plans: DesignPlan[];
  selected: number;
  onSelect: (i: number) => void;
  recipient: CertificateRecipient;
  info: EventInfo;
}

export default function CertificateDraftPicker({ plans, selected, onSelect, recipient, info }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {plans.map((p, i) => {
        const rawSvg = typeof p === 'string' ? p : p.svg || '';
        const svgContent = hydrateCertificate(rawSvg, recipient, info);
        const isSel = i === selected;

        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            type="button"
            className={`group text-left rounded-xl border p-2 transition flex flex-col justify-between ${
              isSel
                ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/50'
                : 'border-white/10 bg-white/5 hover:border-amber-500/40'
            }`}
          >
            <div
              className="w-full aspect-[297/210] overflow-hidden rounded-lg bg-neutral-900 border border-white/5 shadow-md [&_svg]:h-auto [&_svg]:w-full"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
            <div className="mt-2 flex items-center justify-between text-xs px-1 gap-2">
              <span className={`font-semibold truncate ${isSel ? 'text-amber-400' : 'text-neutral-300'}`}>
                {p.style.replace(/^(?:cert_)?draft_/, 'Style ').replace(/[-_]/g, ' ')}
              </span>
              <span className={`text-[10px] rounded px-1.5 py-0.5 shrink-0 ${isSel ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-neutral-400'}`}>
                {isSel ? 'Selected' : 'Select'}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
