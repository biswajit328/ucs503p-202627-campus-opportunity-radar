import { useState } from "react";
import type { Recommendation } from "../types/recommendation";
import { getDeadlineUrgency, formatDeadline, urgencyStyles, daysUntil } from "../utils/deadline";
import { ScoreBreakdownBar } from "./ScoreBreakdownBar";
import { getCategoryStyle } from "../utils/category";

interface Props {
  recommendation: Recommendation;
  isBookmarked: boolean;
  onToggleBookmark: (opportunityId: number) => void;
  toggling: boolean;
  isTracked?: boolean;
  onTrack?: (opportunityId: number) => void;
  tracking?: boolean;
  initiallyExpanded?: boolean;
}

export function RecommendationCard({
  recommendation,
  isBookmarked,
  onToggleBookmark,
  toggling,
  isTracked = false,
  onTrack,
  tracking = false,
  initiallyExpanded = false,
}: Props) {
  const { opportunity, match_score, eligibility_status, reasons, score_breakdown } = recommendation;
  const urgency = opportunity.deadline ? getDeadlineUrgency(opportunity.deadline) : "NORMAL";
  const category = getCategoryStyle(opportunity.category);

  const breakdownItems = score_breakdown
    ? [
        { label: "Skills", score: score_breakdown.skill_score, maxScore: 1, color: "bg-teal-400" },
        { label: "Eligibility", score: score_breakdown.eligibility_score, maxScore: 1, color: "bg-teal-300" },
        { label: "Interests", score: score_breakdown.interest_score, maxScore: 1, color: "bg-amber-400" },
        { label: "Deadline", score: score_breakdown.deadline_score, maxScore: 1, color: "bg-amber-300" },
        { label: "Mode", score: score_breakdown.mode_score, maxScore: 1, color: "bg-ink-muted" },
      ]
    : [];

  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  // Data inconsistency fix: never claim deadline is far off if deadline doesn't exist
  const safeReasons = reasons.filter(r => {
    if (!opportunity.deadline && r.toLowerCase().includes("deadline")) return false;
    return true;
  });

  const scoreColor = match_score >= 75 ? "text-teal-400" : match_score >= 50 ? "text-amber-400" : "text-ink-muted";

  const displayMode = opportunity.mode === "OFFLINE" ? "Offline" : opportunity.mode === "ONLINE" ? "Online" : "Mode not specified";
  const locationTag = opportunity.location ? opportunity.location : displayMode === "Offline" ? "Location not specified" : displayMode;

  let formattedDeadline = "Deadline not available";
  if (opportunity.deadline) {
    const dStr = formatDeadline(opportunity.deadline);
    if (urgency === "EXPIRED") {
      formattedDeadline = `Expired · ${dStr}`;
    } else if (urgency === "URGENT" || urgency === "SOON") {
      const days = daysUntil(opportunity.deadline);
      formattedDeadline = `Closes in ${days} day${days !== 1 ? 's' : ''}`;
    } else {
      formattedDeadline = dStr;
    }
  }

  const tags = [
    locationTag,
    formattedDeadline
  ].filter(Boolean);

  if (!isExpanded) {
    return (
      <div
        onClick={() => setIsExpanded(true)}
        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-navy-800/40 last:border-0 hover:bg-navy-900/40 hover:border-transparent px-3 -mx-3 rounded-xl cursor-pointer transition-all duration-200"
      >
        <div className="flex-1 min-w-0 flex items-center gap-4">
          <div className={`shrink-0 w-12 text-center`}>
            <span className={`text-[13px] font-bold ${scoreColor}`}>{Math.round(match_score)}%</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted">
              <span className="text-ink truncate">{category.label}</span>
              <span className="text-navy-700">&middot;</span>
              <span className="truncate">{opportunity.organizer}</span>
            </div>
            <h3 className="text-[15px] font-semibold text-ink truncate mb-1 group-hover:text-teal-400 transition-colors">
              {opportunity.title}
            </h3>
            <div className="flex items-center gap-3 text-[12px] text-ink-muted truncate">
              {safeReasons.slice(0, 1).map((r, i) => (
                <span key={i} className="truncate"><span className="text-teal-400/80 mr-1">✓</span>{r}</span>
              ))}
              <span className="text-navy-700">&middot;</span>
              <span className="truncate">{formattedDeadline}</span>
            </div>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleBookmark(opportunity.id); }}
            disabled={toggling}
            className={`text-[12px] font-medium transition-colors ${
              isBookmarked ? "text-teal-400 hover:text-teal-300" : "text-ink-muted hover:text-ink"
            } disabled:opacity-50`}
          >
            {isBookmarked ? "Saved" : "Save"}
          </button>
          <a
            href={opportunity.registration_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="bg-navy-800 hover:bg-navy-700 text-ink px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
          >
            View &rarr;
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex flex-col md:flex-row gap-10 py-6 border-b border-navy-800/60 last:border-0 bg-navy-950/40 -mx-4 px-4 rounded-lg my-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">

      <button
        onClick={() => setIsExpanded(false)}
        className="absolute top-4 right-4 p-1.5 text-ink-muted hover:text-ink hover:bg-navy-800 rounded transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* LEFT COLUMN: OPPORTUNITY DETAILS */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 text-[11px] font-medium uppercase tracking-[0.15em] text-ink-muted">
          <span className="text-ink">{category.label}</span>
          <span className="text-navy-700">&middot;</span>
          <span className="truncate">{opportunity.organizer}</span>
        </div>

        <h3 className="font-display text-xl md:text-2xl font-semibold text-ink leading-tight mb-4 pr-6">
          {opportunity.title}
        </h3>

        {opportunity.description && (
          <p className="text-[13px] text-ink-muted mb-6 leading-relaxed line-clamp-3">
            {opportunity.description}
          </p>
        )}

        <div className="flex flex-col gap-1.5 text-[13px] text-ink-muted mb-6">
          {eligibility_status === "UNCERTAIN" && (
            <div className="flex items-start gap-2">
              <span className="shrink-0 text-amber-400 mt-0.5 font-bold">!</span>
              <span className="text-amber-300">Eligibility could not be confirmed</span>
            </div>
          )}
          {eligibility_status === "NOT_ELIGIBLE" && (
            <div className="flex items-start gap-2">
              <span className="shrink-0 text-ink-muted mt-0.5 font-bold">x</span>
              <span>May not meet criteria</span>
            </div>
          )}
          {safeReasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="shrink-0 text-teal-500 mt-0.5">✓</span>
              <span className="line-clamp-2">{reason}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-[13px] text-ink-muted">
          {tags.map((t, idx) => (
            <span key={idx} className="flex items-center gap-2.5">
              {t}
              {idx < tags.length - 1 && <span className="text-navy-700">&middot;</span>}
            </span>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: MATCH EXPLANATION & ACTIONS */}
      <div className="w-full md:w-[280px] shrink-0 flex flex-col">

        <div className="mb-6">
          <span className="text-[10px] font-semibold tracking-[0.15em] text-ink-faint uppercase mb-1 block">Match</span>
          <span className={`text-2xl font-bold tracking-tight ${scoreColor}`}>
            {Math.round(match_score)}%
          </span>
        </div>

        {(safeReasons.length > 0 || eligibility_status) && (
          <div className="mb-8">
            <h4 className="text-[10px] font-semibold tracking-[0.15em] text-ink-faint uppercase mb-3">
              Why Nexora Recommends This
            </h4>
            <div className="flex flex-col gap-3">
              {(() => {
                const evidenceList = [
                  { label: "Skills", reason: safeReasons.find(r => r.toLowerCase().includes("skills")) },
                  { label: "Interests", reason: safeReasons.find(r => r.toLowerCase().includes("interests")) },
                  { label: "Eligibility", reason: eligibility_status === "ELIGIBLE" ? "Confirmed" : eligibility_status === "UNCERTAIN" ? "Needs confirmation" : "Not eligible" },
                  { label: "Mode", reason: safeReasons.find(r => r.toLowerCase().includes("mode")) },
                ].filter(item => item.reason);

                return evidenceList.map((item, idx) => (
                   <div key={idx} className="flex flex-col text-[12px] pb-2.5 border-b border-navy-800/40 last:border-0 last:pb-0">
                      <span className="text-ink-muted mb-0.5">{item.label}</span>
                      <span className="text-ink font-medium leading-relaxed">{item.reason}</span>
                   </div>
                ));
              })()}
            </div>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3">
          <a
            href={opportunity.registration_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center bg-teal-400 hover:bg-teal-300 text-navy-950 px-5 py-2 rounded-lg text-[13px] font-semibold transition-colors"
          >
            View opportunity
          </a>
          <button
            onClick={() => onToggleBookmark(opportunity.id)}
            disabled={toggling}
            className={`w-full text-center text-[13px] font-medium transition-colors border rounded-lg py-2 ${
              isBookmarked
                ? "border-teal-400/30 text-teal-400 bg-teal-400/5"
                : "border-navy-700 text-ink-muted hover:text-ink hover:border-navy-600 bg-navy-900/50"
            } disabled:opacity-50`}
          >
            {isBookmarked ? "Saved" : "Save for later"}
          </button>
        </div>
      </div>
    </div>
  );
}
