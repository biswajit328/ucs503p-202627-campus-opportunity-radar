import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  value: string | number;
  label: string;
  accent?: "teal" | "amber";
}

export function StatChip({ icon, value, label, accent = "teal" }: Props) {
  const accentClass = accent === "amber" ? "text-amber-400 bg-amber-400/10 shadow-[inset_0_0_12px_rgba(245,161,92,0.1)]" : "text-teal-400 bg-teal-400/10 shadow-[inset_0_0_12px_rgba(45,212,191,0.1)]";
  return (
    <div className="flex items-center gap-3 glass-panel rounded-xl px-4 py-3 transition-transform hover:-translate-y-0.5">
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${accentClass}`}>{icon}</span>
      <div>
        <p className="font-display text-lg font-semibold text-ink leading-none">{value}</p>
        <p className="text-xs text-ink-muted mt-0.5">{label}</p>
      </div>
    </div>
  );
}