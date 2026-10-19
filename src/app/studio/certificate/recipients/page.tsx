'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudio } from '@/lib/StudioContext';
import { parseCertificateRecipients } from '@/core/data/csv';
import { CertificateRecipient } from '@/types';

export default function CertificateStep3() {
  const { certRecipients, isCertSample, loadCertRecipients, people, isSample } = useStudio();
  const router = useRouter();

  const [problems, setProblems] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { recipients, problems: errs } = parseCertificateRecipients(text);
      if (errs.length) {
        setProblems(errs);
        setSuccessMsg('');
      } else {
        loadCertRecipients(recipients);
        setProblems([]);
        setSuccessMsg(`Loaded ${recipients.length} certificate recipients successfully.`);
      }
    };
    reader.readAsText(file);
  };

  const importFromBadgeAttendees = () => {
    if (!people || !people.length) return;
    const mapped: CertificateRecipient[] = people.map((p) => {
      const isStaff = p.role !== 'participant';
      const roleTitle = p.role.charAt(0).toUpperCase() + p.role.slice(1);
      return {
        name: p.name,
        certificateRole: roleTitle,
        team: isStaff ? undefined : p.team,
        roll_no: p.id,
        department: p.department,
      };
    });
    loadCertRecipients(mapped);
    setProblems([]);
    setSuccessMsg(`Imported ${mapped.length} attendees from your ID card list. You can update their specific roles via CSV or use as-is.`);
  };

  return (
    <section className="space-y-6 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-amber-400">Step 3 of 4 • Certificate Studio</p>
          <h1 className="text-3xl font-bold tracking-tight">Upload Certificate Recipients</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Certificates are issued only to recipients listed here, with their exact award or role.
          </p>
        </div>
      </div>

      {isCertSample && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300">
          Currently displaying sample recipients. Upload your dedicated Certificate CSV below to load your real awardees.
        </div>
      )}

      {/* CSV Upload Section */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-neutral-200">Upload Certificate Recipients CSV</h2>
            <p className="text-xs text-neutral-400">
              Compulsory: <code className="text-amber-300">name</code>, <code className="text-amber-300">certificate_role</code> (or <code className="text-amber-300">award</code>). Optional: <code className="text-neutral-300">team</code>, <code className="text-neutral-300">roll_no</code>, <code className="text-neutral-300">department</code>.
            </p>
          </div>

          {!isSample && people.length > 0 && (
            <button
              type="button"
              onClick={importFromBadgeAttendees}
              className="text-xs rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-amber-300 hover:bg-amber-500/20 transition"
            >
              📥 Import {people.length} Attendees from ID Cards
            </button>
          )}
        </div>

        <div className="rounded-xl border border-dashed border-white/20 bg-neutral-900/60 p-6 text-center">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileUpload}
            className="block w-full text-xs text-neutral-400 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-600 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-amber-500 cursor-pointer"
          />
        </div>

        {problems.length > 0 && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300 space-y-1">
            <p className="font-semibold text-red-200">CSV validation found errors:</p>
            {problems.map((p, i) => (
              <p key={i}>• {p}</p>
            ))}
          </div>
        )}

        {successMsg && <p className="text-xs text-emerald-400 font-medium">{successMsg}</p>}
      </div>

      {/* Recipients Table Preview */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-200">
            Recipients List ({certRecipients.length} {certRecipients.length === 1 ? 'person' : 'people'})
          </h2>
          <span className="text-xs text-neutral-400">Exact role printed on certificate</span>
        </div>

        <div className="max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-neutral-950">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-900/80 sticky top-0 text-neutral-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-2.5">Recipient Name</th>
                <th className="px-4 py-2.5">Exact Role / Award</th>
                <th className="px-4 py-2.5">Team</th>
                <th className="px-4 py-2.5">Roll No</th>
                <th className="px-4 py-2.5">Department</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {certRecipients.map((r, i) => (
                <tr key={i} className="hover:bg-white/5">
                  <td className="px-4 py-2 font-medium text-white">{r.name}</td>
                  <td className="px-4 py-2">
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-300 font-medium">
                      {r.certificateRole}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-neutral-400">
                    {r.team ? <span className="text-amber-200">{r.team}</span> : <span className="text-neutral-600">—</span>}
                  </td>
                  <td className="px-4 py-2 text-neutral-400">{r.roll_no || '—'}</td>
                  <td className="px-4 py-2 text-neutral-400">{r.department || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={() => router.push('/studio/certificate/export')}
        className="w-full rounded-xl bg-amber-600 py-3.5 text-lg font-semibold text-white transition hover:bg-amber-500"
      >
        Continue to Certificate Export →
      </button>
    </section>
  );
}
