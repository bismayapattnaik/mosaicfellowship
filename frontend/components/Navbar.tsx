"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/recruiter", label: "Dashboard" },
  { href: "/recruiter/jobs", label: "Jobs" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-[#080808]/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/" className="group flex items-center gap-2">
              <span className="font-heading font-bold text-2xl tracking-tighter uppercase leading-none">
                BEAT<span className="text-acid">.</span>CLAUDE
              </span>
            </Link>
            <div className="hidden md:block w-px h-6 bg-white/20" />
            <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Systems Nominal
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/recruiter" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-heading font-semibold text-lg uppercase tracking-wide transition-colors ${
                    isActive ? "text-acid" : "hover:text-acid"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/candidate"
            className="bg-white text-black px-6 py-2 font-heading font-bold text-sm uppercase tracking-wide hover:bg-acid transition-colors flex items-center gap-2"
          >
            Candidate Portal
          </Link>
        </div>
      </div>
    </header>
  );
}
