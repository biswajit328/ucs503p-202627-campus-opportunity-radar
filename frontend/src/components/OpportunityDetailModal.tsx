import { useEffect } from "react";
import type { Opportunity } from "../types/opportunity";
import { getDeadlineUrgency, formatDeadline, urgencyStyles, daysUntil } from "../utils/deadline";
import { getCategoryStyle } from "../utils/category";

interface Props {
  opportunity: Opportunity;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: number) => void;
  toggling: boolean;
}

export function OpportunityDetailModal({
  opportunity,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark,
  toggling,
}: Props) {
  const urgency = getDeadlineUrgency(opportunity.deadline);
  const category = getCategoryStyle(opportunity.category);
  const days = daysUntil(opportunity.deadline);

  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add("modal-open");

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-navy-950/80 backdrop-blur-sm p-4 sm:p-8 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={opportunity.title}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-navy-700 bg-navy-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Category color bar */}
        <div className={`h-1.5 w-full rounded-t-2xl ${category.rule}`} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-navy-700 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
          aria-label="Close"
        >
          ×
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className={`inline-flex rounded-md border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${category.chip}`}
              >
                {category.label}
              </span>
              <span
                className={`rounded-md border px-2 py-1 text-[11px] font-medium ${urgencyStyles[urgency]}`}
              >
                {days < 0
                  ? "Expired"
                  : days === 0
                    ? "Closes today"
                    : days === 1
                      ? "1 day left"
                      : `${days} days left`}
              </span>
              <span className="text-xs text-ink-muted">
                {formatDeadline(opportunity.deadline)}
              </span>
            </div>
            <h2 className="font-display text-2xl font-semibold text-ink leading-tight">
              {opportunity.title}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">{opportunity.organizer}</p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted mb-2">
              About
            </h3>
            <p className="text-sm leading-7 text-ink/90 whitespace-pre-line">
              {opportunity.description}
            </p>
          </div>

          {/* Skills */}
          {opportunity.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted mb-2">
                Skills required
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {opportunity.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-teal-400/10 border border-teal-400/25 px-2 py-1 text-xs font-medium text-teal-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Eligibility */}
          {opportunity.eligibility && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted mb-2">
                Eligibility
              </h3>
              <div className="flex flex-wrap gap-3 text-sm text-ink-muted">
                {opportunity.eligibility.eligible_branches.length > 0 && (
                  <span>
                    Branches: {opportunity.eligibility.eligible_branches.join(", ")}
                  </span>
                )}
                {opportunity.eligibility.eligible_semesters.length > 0 && (
                  <span>
                    Semesters: {opportunity.eligibility.eligible_semesters.join(", ")}
                  </span>
                )}
                {opportunity.eligibility.is_uncertain && (
                  <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-xs text-amber-300">
                    Eligibility may vary — check details
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Details grid */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-navy-700 bg-navy-900/60 p-3">
              <p className="text-[10px] uppercase tracking-wider text-ink-muted">
                Mode
              </p>
              <p className="mt-0.5 text-sm font-medium text-ink">
                {opportunity.mode.charAt(0) + opportunity.mode.slice(1).toLowerCase()}
              </p>
            </div>
            {opportunity.location && (
              <div className="rounded-xl border border-navy-700 bg-navy-900/60 p-3">
                <p className="text-[10px] uppercase tracking-wider text-ink-muted">
                  Location
                </p>
                <p className="mt-0.5 text-sm font-medium text-ink">
                  {opportunity.location}
                </p>
              </div>
            )}
            {opportunity.duration && (
              <div className="rounded-xl border border-navy-700 bg-navy-900/60 p-3">
                <p className="text-[10px] uppercase tracking-wider text-ink-muted">
                  Duration
                </p>
                <p className="mt-0.5 text-sm font-medium text-ink">
                  {opportunity.duration}
                </p>
              </div>
            )}
            {opportunity.start_date && (
              <div className="rounded-xl border border-navy-700 bg-navy-900/60 p-3">
                <p className="text-[10px] uppercase tracking-wider text-ink-muted">
                  Starts
                </p>
                <p className="mt-0.5 text-sm font-medium text-ink">
                  {new Date(opportunity.start_date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <a
              href={opportunity.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg bg-teal-400 px-4 py-3 text-center text-sm font-semibold text-navy-950 transition-colors hover:bg-teal-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
            >
              Apply / Register ↗
            </a>
            <button
              onClick={() => onToggleBookmark(opportunity.id)}
              disabled={toggling}
              className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 disabled:opacity-50 ${
                isBookmarked
                  ? "border-teal-400/50 bg-teal-400/10 text-teal-300"
                  : "border-navy-700 bg-navy-900 text-ink-muted hover:border-ink-muted hover:text-ink"
              }`}
            >
              {isBookmarked ? "✓ Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
