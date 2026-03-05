import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080808] relative overflow-hidden flex flex-col">
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-grid pointer-events-none" />

      {/* Nav */}
      <header className="relative z-10 border-b border-white/10 bg-[#080808]/95 backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-heading font-bold text-2xl tracking-tighter uppercase leading-none">
                BEAT<span className="text-acid">.</span>CLAUDE
              </span>
            </Link>
            <div className="hidden md:block w-px h-6 bg-white/20" />
            <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              AI Hiring Platform
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/candidate" className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:text-acid transition-colors">
              Take Assessment
            </Link>
            <Link href="/recruiter" className="bg-white text-black px-6 py-2 font-heading font-bold text-sm uppercase tracking-wide hover:bg-acid transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-end border-b border-white/10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-transparent" />
          <div className="relative w-full max-w-screen-2xl mx-auto px-6 md:px-12 z-10 pb-20 pt-32">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-acid text-black px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest">
                Now Live
              </div>
              <div className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">
                AI-Powered Hiring
              </div>
            </div>
            <h1 className="font-heading font-bold text-7xl md:text-[9rem] leading-[0.85] tracking-tighter uppercase text-white mb-8">
              Screen<br />Smarter<span className="text-acid">.</span><br />
              <span className="text-transparent" style={{ WebkitTextStroke: "2px white" }}>
                Hire Faster
              </span>
            </h1>
            <div className="flex flex-col md:flex-row md:items-end justify-between w-full border-t border-white/20 pt-8">
              <p className="text-lg md:text-xl text-zinc-400 max-w-xl font-medium leading-snug">
                Paste a job description. Get a tailored assessment in 60 seconds.
                Score candidates deterministically. Rank them on a live leaderboard.
              </p>
              <div className="mt-8 md:mt-0 flex gap-4">
                <Link
                  href="/recruiter"
                  className="bg-acid text-black px-8 py-3 font-heading font-bold text-lg uppercase tracking-wide hover:bg-white transition-colors"
                >
                  Open Dashboard
                </Link>
                <Link
                  href="/candidate"
                  className="border border-white/20 px-8 py-3 font-heading font-bold text-lg uppercase tracking-wide hover:bg-acid hover:text-black hover:border-acid transition-colors"
                >
                  Take Assessment
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Acid Section */}
        <section className="bg-acid text-black py-24 md:py-32 relative">
          <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4">
                <div className="flex items-center gap-2 mb-8">
                  <span className="font-mono text-xs font-bold uppercase tracking-widest">How It Works</span>
                </div>
              </div>
              <div className="lg:col-span-8">
                <h2 className="font-heading font-black text-6xl md:text-8xl lg:text-9xl uppercase leading-[0.85] tracking-tighter mb-8">
                  Paste JD.<br />Get test.<br />Score all.
                </h2>
                <p className="font-medium text-xl md:text-2xl leading-tight max-w-2xl border-l-4 border-black pl-6">
                  Beat Claude is an AI hiring companion that converts job descriptions into tailored assessments, scores candidates with deterministic rubrics, and ranks them on a live leaderboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 md:py-32 border-b border-white/10 bg-[#080808]">
          <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 border-b border-white/10 pb-8">
              <h2 className="font-heading font-bold text-5xl md:text-7xl uppercase tracking-tighter text-white">
                Tactical<br />Overview
              </h2>
              <div className="mt-6 md:mt-0 flex items-center gap-4 text-zinc-500 font-mono text-xs uppercase">
                <span>Speed: 60s</span>
                <span>//</span>
                <span>Accuracy: 100%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10">
              <div className="bg-[#080808] p-8 md:p-12 group hover:bg-[#0C0C0C] transition-colors relative">
                <div className="absolute top-8 right-8 text-zinc-700 font-heading font-bold text-6xl opacity-20 group-hover:opacity-40 transition-opacity">01</div>
                <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-12 text-acid group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-3xl uppercase tracking-wide text-white mb-4">JD Parsing</h3>
                <p className="text-zinc-400 leading-relaxed text-sm mb-8">
                  AI extracts skills, seniority, domain, and responsibilities from any job description in seconds.
                </p>
                <ul className="space-y-2 border-t border-white/10 pt-6">
                  <li className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase">
                    <span className="text-acid">✓</span> Skill Extraction
                  </li>
                  <li className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase">
                    <span className="text-acid">✓</span> Domain Detection
                  </li>
                </ul>
              </div>

              <div className="bg-[#080808] p-8 md:p-12 group hover:bg-[#0C0C0C] transition-colors relative">
                <div className="absolute top-8 right-8 text-zinc-700 font-heading font-bold text-6xl opacity-20 group-hover:opacity-40 transition-opacity">02</div>
                <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-12 text-acid group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-3xl uppercase tracking-wide text-white mb-4">AI Scoring</h3>
                <p className="text-zinc-400 leading-relaxed text-sm mb-8">
                  Deterministic rubric-based grading. Same answer always gets the same score. No bias, no variance.
                </p>
                <ul className="space-y-2 border-t border-white/10 pt-6">
                  <li className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase">
                    <span className="text-acid">✓</span> Multi-Dimension Scoring
                  </li>
                  <li className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase">
                    <span className="text-acid">✓</span> Confidence Levels
                  </li>
                </ul>
              </div>

              <div className="bg-[#080808] p-8 md:p-12 group hover:bg-[#0C0C0C] transition-colors relative">
                <div className="absolute top-8 right-8 text-zinc-700 font-heading font-bold text-6xl opacity-20 group-hover:opacity-40 transition-opacity">03</div>
                <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-12 text-acid group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 0 1-2.52.777m5.007 0H9.497m0 0a6.023 6.023 0 0 0 2.52.777" />
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-3xl uppercase tracking-wide text-white mb-4">Leaderboard</h3>
                <p className="text-zinc-400 leading-relaxed text-sm mb-8">
                  Rank candidates by score, filter by recommendation, export results to CSV.
                </p>
                <ul className="space-y-2 border-t border-white/10 pt-6">
                  <li className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase">
                    <span className="text-acid">✓</span> Live Rankings
                  </li>
                  <li className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase">
                    <span className="text-acid">✓</span> CSV Export
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 bg-[#080808]">
          <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-3 gap-px bg-white/10 border border-white/10">
              {[
                { value: "60s", label: "Assessment Generation" },
                { value: "100%", label: "Deterministic Scoring" },
                { value: "80%", label: "Time Saved" },
              ].map((s, i) => (
                <div key={i} className="bg-[#080808] p-8 md:p-12 text-center group hover:bg-[#0C0C0C] transition-colors">
                  <div className="font-heading font-bold text-5xl md:text-7xl text-white group-hover:text-acid transition-colors mb-2">
                    {s.value}
                  </div>
                  <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0A0A0A]">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-xl uppercase tracking-tighter">
                BEAT<span className="text-acid">.</span>CLAUDE
              </span>
            </div>
            <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
              AI Hiring Companion — Powered by Claude
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
