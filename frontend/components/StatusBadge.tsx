interface StatusBadgeProps {
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  parsed: "bg-blue-100 text-blue-700",
  assessment_generated: "bg-green-100 text-green-700",
  invited: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-orange-100 text-orange-700",
  submitted: "bg-purple-100 text-purple-700",
  scored: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-700",
  advance: "bg-green-100 text-green-800",
  consider: "bg-yellow-100 text-yellow-800",
  reject: "bg-red-100 text-red-800",
  active: "bg-green-100 text-green-700",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const color = STATUS_COLORS[status] || "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
