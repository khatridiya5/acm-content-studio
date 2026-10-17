'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const STEPS = [
  { href: '/studio', label: 'Describe' },
  { href: '/studio/drafts', label: 'Pick a draft' },
  { href: '/studio/people', label: 'Attendees' },
  { href: '/studio/export', label: 'Export' },
];

export default function Stepper() {
  const path = usePathname();
  const cur = Math.max(0, STEPS.findIndex((s) => s.href === path));
  return (
    <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-6">
      <Link href="/" className="font-semibold tracking-tight">ACM <span className="text-violet-400">Content Studio</span></Link>
      <ol className="flex items-center gap-2 text-sm">
        {STEPS.map((s, i) => (
          <li key={s.href} className="flex items-center gap-2">
            <Link href={s.href} className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition ${i === cur ? 'bg-violet-600 text-white' : i < cur ? 'text-violet-300 hover:bg-white/5' : 'text-neutral-500 hover:bg-white/5'}`}>
              <span className={`grid h-5 w-5 place-items-center rounded-full text-xs ${i <= cur ? 'bg-white/20' : 'bg-white/10'}`}>{i < cur ? '✓' : i + 1}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </Link>
            {i < STEPS.length - 1 && <span className="h-px w-4 bg-white/15" />}
          </li>
        ))}
      </ol>
    </header>
  );
}
