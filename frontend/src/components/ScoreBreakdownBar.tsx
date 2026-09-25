interface BreakdownItem {
  label: string;
  score: number;
  maxScore: number;
  color: string;
}

interface Props {
  breakdown: BreakdownItem[];
}

export function ScoreBreakdownBar({ breakdown }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {breakdown.map(({ label, score, maxScore, color }) => {
        const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
        return (
          <div key={label} className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-[11px] text-ink-muted">
              {label}
            </span>
            <div className="relative h-1.5 flex-1 rounded-full bg-navy-700">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${color}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-[11px] font-medium text-ink-muted">
              {pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
