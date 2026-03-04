interface ScoreBarProps {
  label: string;
  value: number;
  max?: number;
}

export default function ScoreBar({ label, value, max = 100 }: ScoreBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const color =
    percentage >= 75
      ? "from-emerald-400 to-emerald-500"
      : percentage >= 55
      ? "from-amber-400 to-amber-500"
      : "from-red-400 to-red-500";

  return (
    <div className="mb-3">
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-sm text-slate-600">{label}</span>
        <span className="text-sm font-semibold text-slate-900 tabular-nums">
          {Math.round(value)}<span className="text-slate-400 font-normal">/{max}</span>
        </span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
