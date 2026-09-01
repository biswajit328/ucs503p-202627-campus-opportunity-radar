import type { Recommendation } from "../types/recommendation";
import { getDeadlineUrgency, formatDeadline, urgencyStyles } from "../utils/deadline";

interface Props {
  recommendation: Recommendation;
  isBookmarked: boolean;
  onToggleBookmark: (opportunityId: number) => void;
  toggling: boolean;
}

function scoreColor(score: number): string {
  if (score >= 70) return "text-green-400";
  if (score >= 40) return "text-yellow-400";
  return "text-slate-400";
}

export function RecommendationCard({ recommendation, isBookmarked, onToggleBookmark, toggling }: Props) {
  const { opportunity, match_score, eligibility_status, reasons } = recommendation;
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
        <div className="text-right">
          <div className={`text-2xl font-bold ${scoreColor(match_score)}`}>{Math.round(match_score)}%</div>
          <div className="text-xs text-slate-500">Match</div>
        </div>
      </div>

      {eligibility_status === "UNCERTAIN" && (
        <span className="text-xs px-2 py-1 rounded border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 w-fit">
          Eligibility uncertain — check details
        </span>
      )}

      <ul className="flex flex-col gap-1 text-sm text-slate-300">
        {reasons.map((reason, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-green-400 shrink-0">✓</span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className={`px-2 py-0.5 rounded border ${urgencyStyles[urgency]}`}>
          {urgency === "NORMAL" ? formatDeadline(opportunity.deadline) : urgency}
        </span>
        <span>{opportunity.mode}</span>
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