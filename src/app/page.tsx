import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between px-4 py-8">
      {/* Top Header */}
      <header className="mx-auto w-full max-w-5xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-amber-500 p-0.5 shadow-md">
            <div className="h-full w-full rounded-[6px] bg-neutral-950 flex items-center justify-center font-bold text-xs">
              ACM
            </div>
          </div>
          <span className="font-semibold tracking-tight text-lg text-white">Content Studio</span>
        </div>
        <span className="text-xs text-neutral-400 font-medium border border-white/10 rounded-full px-3 py-1">
          ACM SVNIT Student Chapter
        </span>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-4xl text-center py-12 space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-neutral-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Automated Print-Ready Event Production Suite</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Design ID Badges &amp; Certificates <br />
          <span className="bg-gradient-to-r from-violet-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
            in Seconds with AI
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-neutral-400">
          Streamlined event material generation for ACM SVNIT. Share event details, upload attendee CSVs, and batch-export vector PDFs and high-DPI prints.
        </p>

        {/* Studio Cards Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Card 1: ID Cards Studio */}
          <div className="group relative rounded-3xl border border-violet-500/30 bg-gradient-to-b from-violet-950/20 to-neutral-900/60 p-8 hover:border-violet-500/60 transition shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-2xl">
                🪪
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">Badge Studio</span>
                <h2 className="text-2xl font-bold text-white mt-1">Event ID Cards</h2>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                CR80 (54×86mm) portrait badges with attendee photos, role color coding, roll numbers, departments, team labels, and attendance QR codes. Multi-card imposition A4 sheets with crop marks.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5">
              <Link
                href="/studio"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:bg-violet-500"
              >
                <span>Launch ID Card Studio</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Certificate Studio */}
          <div className="group relative rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-neutral-900/60 p-8 hover:border-amber-500/60 transition shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-2xl">
                🎓
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Award Studio</span>
                <h2 className="text-2xl font-bold text-white mt-1">Official Certificates</h2>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                A4 Landscape (297×210mm) Certificates of Excellence, Merit &amp; Participation. Exact recipient roles, team titles, dual official signatures, and digital verification QR codes.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5">
              <Link
                href="/studio/certificate"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-600/30 transition hover:bg-amber-500"
              >
                <span>Launch Certificate Studio</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-5xl text-center text-xs text-neutral-500 py-4 border-t border-white/5">
        ACM Content Studio • Built for ACM SVNIT Student Chapter • Surat, Gujarat
      </footer>
    </main>
  );
}
