import Link from 'next/link';
export default function Empty() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
      <p className="mb-4 text-neutral-300">No designs yet. Start by describing what you need.</p>
      <Link href="/studio" className="rounded-xl bg-violet-600 px-5 py-2.5 font-semibold hover:bg-violet-500">Go to step 1</Link>
    </div>
  );
}
