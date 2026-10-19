'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BADGE_STEPS = [
  { href: '/studio', label: 'Describe' },
  { href: '/studio/drafts', label: 'Pick a draft' },
  { href: '/studio/people', label: 'Attendees' },
  { href: '/studio/export', label: 'Export' },
];

const CERT_STEPS = [
  { href: '/studio/certificate', label: 'Details' },
  { href: '/studio/certificate/drafts', label: 'Pick draft' },
  { href: '/studio/certificate/recipients', label: 'Recipients' },
  { href: '/studio/certificate/export', label: 'Export' },
];

export default function Stepper() {
  const path = usePathname();
  const isCert = path?.startsWith('/studio/certificate');
  const steps = isCert ? CERT_STEPS : BADGE_STEPS;
  const cur = Math.max(0, steps.findIndex((s) => s.href === path));

  const activeColor = isCert ? 'bg-amber-600 text-white' : 'bg-violet-600 text-white';
  const doneColor = isCert ? 'text-amber-300 hover:bg-white/5' : 'text-violet-300 hover:bg-white/5';

  return (
    <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="font-semibold tracking-tight text-lg">
          ACM <span className={isCert ? 'text-amber-400' : 'text-violet-400'}>Studio</span>
        </Link>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${
          isCert
            ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
            : 'border-violet-500/30 bg-violet-500/10 text-violet-300'
        }`}>
          {isCert ? 'Certificates' : 'ID Badges'}
        </span>
      </div>

      <ol className="flex items-center gap-2 text-sm">
        {steps.map((s, i) => (
          <li key={s.href} className="flex items-center gap-2">
            <Link
              href={s.href}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition ${
                i === cur
                  ? activeColor
                  : i < cur
                  ? doneColor
                  : 'text-neutral-500 hover:bg-white/5'
              }`}
            >
              <span className={`grid h-5 w-5 place-items-center rounded-full text-xs ${i <= cur ? 'bg-white/20' : 'bg-white/10'}`}>
                {i < cur ? '✓' : i + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </Link>
            {i < steps.length - 1 && <span className="h-px w-4 bg-white/15" />}
          </li>
        ))}
      </ol>

      <div className="hidden md:flex items-center">
        {isCert ? (
          <Link
            href="/studio"
            className="text-xs text-neutral-400 hover:text-violet-300 transition flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1"
          >
            <span>🪪 Switch to ID Badges</span>
          </Link>
        ) : (
          <Link
            href="/studio/certificate"
            className="text-xs text-neutral-400 hover:text-amber-300 transition flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1"
          >
            <span>🎓 Switch to Certificates</span>
          </Link>
        )}
      </div>
    </header>
  );
}
