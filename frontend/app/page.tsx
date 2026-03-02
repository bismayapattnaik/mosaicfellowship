import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Beat Claude
        </h1>
        <p className="text-xl text-gray-600 mb-2">AI Hiring Companion</p>
        <p className="text-gray-500 mb-10 max-w-lg mx-auto">
          Convert any job description into a tailored assessment, score
          candidates deterministically, and rank them on a leaderboard — all
          powered by AI.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/recruiter"
            className="px-8 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition"
          >
            Recruiter Dashboard
          </Link>
          <Link
            href="/candidate"
            className="px-8 py-3 bg-white text-brand-600 border-2 border-brand-600 rounded-lg font-semibold hover:bg-brand-50 transition"
          >
            Take Assessment
          </Link>
        </div>
      </div>
    </div>
  );
}
