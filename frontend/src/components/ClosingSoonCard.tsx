import { daysUntil } from "../utils/deadline";
import type { Opportunity } from "../types/opportunity";

export function ClosingSoonCard({ opportunity }: { opportunity: Opportunity }) {
  const days = daysUntil(opportunity.deadline);
  return (
    <div className="shrink-0 w-72 relative overflow-hidden bg-gradient-to-br from-navy-800 to-navy-900 border border-navy-700 rounded-2xl p-5">
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-amber-400/10" />
      <p className="relative text-xs text-teal-400 mb-2">{opportunity.category}</p>
      <p className="relative font-display text-base font-semibold text-ink mb-1 line-clamp-2">
        {opportunity.title}
      </p>
      <p className="relative text-ink-muted text-sm mb-4">{opportunity.organizer}</p>
      <div className="relative flex items-center justify-between">
        <span className="text-xs bg-amber-400/15 text-amber-400 px-2 py-1 rounded-md">
          {days <= 0 ? "Closes today" : `${days} day${days === 1 ? "" : "s"} left`}
        </span>
        <span className="text-xs text-ink-muted">{opportunity.mode}</span>
      </div>
    </div>
  );
}