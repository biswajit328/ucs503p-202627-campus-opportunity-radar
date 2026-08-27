import type { Opportunity } from "../types/opportunity";
import { getDeadlineUrgency, formatDeadline, urgencyStyles } from "../utils/deadline";

interface Props {
  opportunity: Opportunity;
  isBookmarked: boolean;
  onToggleBookmark: (opportunityId: number) => void;
  toggling: boolean;
}

export function OpportunityCard({ opportunity, isBookmarked, onToggleBookmark, toggling }: Props) {
  const urgency = getDeadlineUrgency(opportunity.deadline);

  return (
    <div className="bg-slate-800 rounded-lg p-5 flex flex-col gap-3">
      <div className="flex justify-between items-start gap-2">
        <div>
          <span className="text-xs uppercase tracking-wide text-blue-400 font-semibold">
            {opportunity.category}
          </span>
          <h3 className="text-lg font-bold text-white mt-1">{opportunity.title}</h3>
          <p className="text-sm text-slate-400">{opportunity.organizer}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded border whitespace-nowrap ${urgencyStyles[urgency]}`}>
          {urgency === "NORMAL" ? formatDeadline(opportunity.deadline) : urgency}
        </span>
      </div>

      <p className="text-slate-300 text-sm line-clamp-3">{opportunity.description}</p>

      <div className="flex flex-wrap gap-1">
        {opportunity.skills.map((skill) => (
          <span key={skill} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span>{opportunity.mode}</span>
        {opportunity.location && <span>- {opportunity.location}</span>}
        {opportunity.eligibility && (
          <span>- {opportunity.eligibility.eligible_branches.join(", ") || "All branches"}</span>
        )}
      </div>

      <div className="flex gap-2 mt-2">
        
         <a href={opportunity.registration_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-sm font-semibold"
        >
          View Opportunity
        </a>
        <button
          onClick={() => onToggleBookmark(opportunity.id)}
          disabled={toggling}
          className={`px-4 py-2 rounded text-sm font-semibold border ${
            isBookmarked
              ? "bg-slate-700 border-blue-500 text-blue-400"
              : "bg-transparent border-slate-600 text-slate-300 hover:border-slate-400"
          } disabled:opacity-50`}
        >
          {isBookmarked ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}