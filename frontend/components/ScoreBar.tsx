interface ScoreBarProps {
  label: string;
  value: number;
  max?: number;
}

export default function ScoreBar({ label, value, max = 100 }: ScoreBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const color =
    percentage >= 75
      ? "bg-acid"
      : percentage >= 55
      ? "bg-amber-400"
      : "bg-red-400";

  return (
    <div className="mb-3">
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-mono font-bold text-white tabular-nums">
          {Math.round(value)}<span className="text-zinc-600">/{max}</span>
        </span>
      </div>
      <div className="w-full h-1 bg-white/5 overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
