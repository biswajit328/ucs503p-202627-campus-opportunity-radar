import type { Opportunity } from "../types/opportunity";
import { getDeadlineUrgency, formatDeadline, urgencyStyles } from "../utils/deadline";
import { getCategoryStyle } from "../utils/category";

interface Props {
  opportunity: Opportunity;
  isBookmarked: boolean;
  onToggleBookmark: (opportunityId: number) => void;
  toggling: boolean;
  isTracked?: boolean;
  onTrack?: (opportunityId: number) => void;
  tracking?: boolean;
}

export function OpportunityCard({
  opportunity,
  isBookmarked,
  onToggleBookmark,
  toggling,
  isTracked = false,
  onTrack,
  tracking = false,
}: Props) {
  const urgency = getDeadlineUrgency(opportunity.deadline);
  const category = getCategoryStyle(opportunity.category);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-navy-700/80 bg-gradient-to-b from-navy-800 to-navy-800/60 shadow-lg shadow-navy-950/20 transition-all duration-300 hover:-translate-y-1 hover:border-teal-400/50 hover:shadow-[0_8px_30px_rgba(45,212,191,0.12)]">
      <div className={`h-1 w-full ${category.rule}`} />
      <div className="flex flex-1 flex-col gap-4 p-5">
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <span className={`inline-flex border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${category.chip} rounded-md bg-opacity-10 backdrop-blur-sm`}>
            {category.label}
          </span>
          <h3 className="mt-3 font-display text-[1.1rem] font-semibold leading-snug text-ink group-hover:text-teal-50 transition-colors">{opportunity.title}</h3>
          <p className="mt-1 text-sm text-ink-muted flex items-center gap-1.5">
            {opportunity.organizer}
          </p>
        </div>
        <span className={`shrink-0 whitespace-nowrap rounded-md border px-2.5 py-1 text-[11px] font-medium shadow-sm ${urgencyStyles[urgency]}`}>
          {urgency === "NORMAL" ? formatDeadline(opportunity.deadline) : urgency}
        </span>
      </div>

      <p className="line-clamp-3 text-[13px] leading-relaxed text-ink-muted/90">{opportunity.description}</p>

      <div className="flex flex-wrap gap-1.5 mt-1">
        {opportunity.skills.slice(0, 4).map((skill) => (
          <span key={skill} className="rounded-md bg-navy-900/80 border border-navy-700 px-2 py-1 text-[11px] font-medium text-ink-muted/90">
            {skill}
          </span>
        ))}
        {opportunity.skills.length > 4 && <span className="px-1.5 py-1 text-[11px] font-medium text-ink-muted/70">+{opportunity.skills.length - 4}</span>}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-navy-700/50 pt-4 text-[11px] font-medium tracking-wide uppercase text-ink-faint">
        <span className="flex items-center gap-1">{opportunity.mode.replace("_", " ")}</span>
        {opportunity.location && <span className="flex items-center gap-1">{opportunity.location}</span>}
        {opportunity.eligibility && (
          <span className="flex items-center gap-1">{opportunity.eligibility.eligible_branches.join(", ") || "All branches"}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <a
          href={opportunity.registration_url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-teal-400 px-3 py-2.5 text-center text-sm font-semibold text-navy-950 transition-colors hover:bg-teal-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
        >
          Details
        </a>
        <button
          onClick={() => onToggleBookmark(opportunity.id)}
          disabled={toggling}
          className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 ${
            isBookmarked
              ? "border-teal-400/50 bg-teal-400/10 text-teal-300"
              : "border-navy-700 bg-navy-900 text-ink-muted hover:border-ink-muted hover:text-ink"
          } disabled:opacity-50`}
        >
          {isBookmarked ? "Saved" : "Save"}
        </button>
      </div>
      {onTrack && (
        <button
          onClick={() => onTrack(opportunity.id)}
          disabled={isTracked || tracking}
          className="w-full text-left text-sm font-medium text-ink-muted transition-colors hover:text-teal-300 disabled:cursor-default disabled:text-teal-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
        >
          {isTracked ? "✓ Tracking application" : tracking ? "Adding to tracker…" : "Add to application tracker"}
        </button>
      )}
      </div>
    </article>
  );
}
