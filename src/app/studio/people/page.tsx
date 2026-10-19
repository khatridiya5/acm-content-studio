'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudio } from '@/lib/StudioContext';
import CsvUpload from '@/components/CsvUpload';
import PersonList from '@/components/PersonList';

export default function Step2() {
  const { people, isSample, loadPeople, pi, setPi, info } = useStudio();
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  // Prefetch export route so transition is instant
  useEffect(() => {
    router.prefetch('/studio/export');
  }, [router]);

  const handleContinue = () => {
    setNavigating(true);
    router.push('/studio/export');
  };

  return (
    <section className="mx-auto max-w-2xl space-y-5 pt-6">
      <p className="text-sm text-violet-400">Step 3 of 4</p>
      <h1 className="text-3xl font-bold tracking-tight">Who are the cards for?</h1>
      {isSample && <p className="text-sm text-amber-300">Showing sample people for preview only. Upload your real CSV below.</p>}
      <CsvUpload info={info} onLoaded={loadPeople} />
      <PersonList people={people} index={pi} onSelect={setPi} />
      <button
        onClick={handleContinue}
        disabled={navigating}
        onMouseEnter={() => router.prefetch('/studio/export')}
        className="w-full rounded-xl bg-violet-600 py-3.5 text-lg font-semibold hover:bg-violet-500 disabled:opacity-80 transition-all flex items-center justify-center gap-2"
      >
        {navigating ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span>Loading Export Studio…</span>
          </>
        ) : (
          'Continue to export →'
        )}
      </button>
    </section>
  );
}