import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">ACM Content Studio</h1>
      <p className="text-neutral-500">Describe your event. Get print-ready ID cards.</p>
      <Link href="/studio" className="rounded-lg bg-violet-600 px-5 py-2 font-semibold text-white">Open studio</Link>
    </main>
  );
}
