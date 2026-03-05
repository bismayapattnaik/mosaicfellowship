interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  draft:                { bg: "border-zinc-700",     text: "text-zinc-400" },
  parsed:               { bg: "border-sky-500/30",   text: "text-sky-400" },
  assessment_generated: { bg: "border-acid/30",      text: "text-acid" },
  invited:              { bg: "border-amber-500/30", text: "text-amber-400" },
  in_progress:          { bg: "border-orange-500/30",text: "text-orange-400" },
  submitted:            { bg: "border-violet-500/30",text: "text-violet-400" },
  scored:               { bg: "border-emerald-500/30",text: "text-emerald-400" },
  expired:              { bg: "border-red-500/30",   text: "text-red-400" },
  advance:              { bg: "border-emerald-500/30",text: "text-emerald-400" },
  consider:             { bg: "border-amber-500/30", text: "text-amber-400" },
  reject:               { bg: "border-red-500/30",   text: "text-red-400" },
  active:               { bg: "border-emerald-500/30",text: "text-emerald-400" },
  mcq:                  { bg: "border-blue-500/30",  text: "text-blue-400" },
  short_answer:         { bg: "border-teal-500/30",  text: "text-teal-400" },
  scenario:             { bg: "border-purple-500/30",text: "text-purple-400" },
  mini_case:            { bg: "border-pink-500/30",  text: "text-pink-400" },
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
  const sizeClass = size === "md" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]";

  return (
    <span
      className={`inline-flex items-center font-mono font-bold uppercase tracking-widest border ${config.bg} ${config.text} ${sizeClass}`}
    >
      {label}
    </span>
  );
}
