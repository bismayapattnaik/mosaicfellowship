interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  draft:                { bg: "bg-slate-50",   text: "text-slate-700",   dot: "bg-slate-400" },
  parsed:               { bg: "bg-sky-50",     text: "text-sky-700",     dot: "bg-sky-400" },
  assessment_generated: { bg: "bg-indigo-50",  text: "text-indigo-700",  dot: "bg-indigo-400" },
  invited:              { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400" },
  in_progress:          { bg: "bg-orange-50",  text: "text-orange-700",  dot: "bg-orange-400" },
  submitted:            { bg: "bg-violet-50",  text: "text-violet-700",  dot: "bg-violet-400" },
  scored:               { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  expired:              { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-400" },
  advance:              { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  consider:             { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500" },
  reject:               { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500" },
  active:               { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  mcq:                  { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-400" },
  short_answer:         { bg: "bg-teal-50",    text: "text-teal-700",    dot: "bg-teal-400" },
  scenario:             { bg: "bg-purple-50",  text: "text-purple-700",  dot: "bg-purple-400" },
  mini_case:            { bg: "bg-pink-50",    text: "text-pink-700",    dot: "bg-pink-400" },
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
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.text} ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {label}
    </span>
  );
}
