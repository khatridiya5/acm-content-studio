'use client';
import { useRouter } from 'next/navigation';
import { useStudio } from '@/lib/StudioContext';
import CsvUpload from '@/components/CsvUpload';
import PersonList from '@/components/PersonList';

export default function Step2() {
  const { people, isSample, loadPeople, pi, setPi, info } = useStudio();
  const router = useRouter();
  return (
    <section className="mx-auto max-w-2xl space-y-5 pt-6">
      <p className="text-sm text-violet-400">Step 3 of 4</p>
      <h1 className="text-3xl font-bold tracking-tight">Who are the cards for?</h1>
      {isSample && <p className="text-sm text-amber-300">Showing sample people for preview only. Upload your real CSV below.</p>}
      <CsvUpload info={info} onLoaded={loadPeople} />
      <PersonList people={people} index={pi} onSelect={setPi} />
      <button onClick={() => router.push('/studio/export')} className="w-full rounded-xl bg-violet-600 py-3.5 text-lg font-semibold hover:bg-violet-500">
        Continue to export →
      </button>
    </section>
  );
}