interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  draft:                { bg: "bg-white/[0.06]",     text: "text-white/60",     dot: "bg-white/40" },
  parsed:               { bg: "bg-sky-500/10",       text: "text-sky-400",      dot: "bg-sky-400" },
  assessment_generated: { bg: "bg-brand-500/10",     text: "text-brand-300",    dot: "bg-brand-400" },
  invited:              { bg: "bg-amber-500/10",     text: "text-amber-400",    dot: "bg-amber-400" },
  in_progress:          { bg: "bg-orange-500/10",    text: "text-orange-400",   dot: "bg-orange-400" },
  submitted:            { bg: "bg-violet-500/10",    text: "text-violet-400",   dot: "bg-violet-400" },
  scored:               { bg: "bg-emerald-500/10",   text: "text-emerald-400",  dot: "bg-emerald-400" },
  expired:              { bg: "bg-red-500/10",       text: "text-red-400",      dot: "bg-red-400" },
  advance:              { bg: "bg-emerald-500/15",   text: "text-emerald-400",  dot: "bg-emerald-400" },
  consider:             { bg: "bg-amber-500/15",     text: "text-amber-400",    dot: "bg-amber-400" },
  reject:               { bg: "bg-red-500/15",       text: "text-red-400",      dot: "bg-red-400" },
  active:               { bg: "bg-emerald-500/10",   text: "text-emerald-400",  dot: "bg-emerald-400" },
  mcq:                  { bg: "bg-blue-500/10",      text: "text-blue-400",     dot: "bg-blue-400" },
  short_answer:         { bg: "bg-teal-500/10",      text: "text-teal-400",     dot: "bg-teal-400" },
  scenario:             { bg: "bg-purple-500/10",    text: "text-purple-400",   dot: "bg-purple-400" },
  mini_case:            { bg: "bg-pink-500/10",      text: "text-pink-400",     dot: "bg-pink-400" },
};

const LABEL_MAP: Record<string, string> = {
  draft: "Draft",
  parsed: "Parsed",
  assessment_generated: "Assessment Ready",
  invited: "Invited",
  in_progress: "In Progress",
  submitted: "Submitted",
  scored: "Scored",
  expired: "Expired",
  advance: "Advance",
  consider: "Consider",
  reject: "Reject",
  active: "Active",
  mcq: "MCQ",
  short_answer: "Short Answer",
  scenario: "Scenario",
  mini_case: "Mini Case",
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const label = LABEL_MAP[status] || status.replace(/_/g, " ");
  const sizeClass = size === "md" ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border border-white/[0.06] ${config.bg} ${config.text} ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {label}
    </span>
  );
}
