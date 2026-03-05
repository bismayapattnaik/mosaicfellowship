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
    <nav className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-[0_0_15px_rgba(124,77,255,0.3)] group-hover:shadow-[0_0_25px_rgba(124,77,255,0.4)] transition-shadow">
                BC
              </div>
              <span className="text-sm font-bold text-white">Beat Claude</span>
            </Link>
            <div className="flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/recruiter" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-white/[0.08] text-white"
                        : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <Link href="/candidate" className="btn-secondary text-xs px-4 py-1.5">
            Candidate Portal
          </Link>
        </div>
      </div>
    </nav>
  );
}
