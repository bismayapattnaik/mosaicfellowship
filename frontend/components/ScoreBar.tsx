interface ScoreBarProps {
  label: string;
  value: number;
  max?: number;
}

export default function ScoreBar({ label, value, max = 100 }: ScoreBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const color =
    percentage >= 75
      ? "bg-green-500"
      : percentage >= 55
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{Math.round(value)}</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
