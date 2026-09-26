import { useEffect, useState } from "react";
import type { Recommendation } from "../types/recommendation";
import { formatDeadline } from "../utils/deadline";

interface Props {
  recommendation: Recommendation;
  isBookmarked: boolean;
  onToggleBookmark: (id: number) => void;
  toggling: boolean;
}

// Hook for animated counter
function useCountUp(end: number, duration: number = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number;
    let animationFrame: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      }
    };

    animationFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
}

export function TopMatchBespoke({ recommendation, isBookmarked, onToggleBookmark, toggling }: Props) {
  const { opportunity, match_score, eligibility_status, reasons } = recommendation;
  const score = Math.round(match_score);
  const animatedScore = useCountUp(score, 1200);

  const safeReasons = reasons.filter(r => {
    if (!opportunity.deadline && r.toLowerCase().includes("deadline")) return false;
    return true;
  });

  const getEvidence = (keyword: string) => safeReasons.find(r => r.toLowerCase().includes(keyword));

  const evidenceList = [
    { label: "Skills", reason: getEvidence("skills") },
    { label: "Interests", reason: getEvidence("interests") },
    { label: "Eligibility", reason: eligibility_status === "ELIGIBLE" ? "Confirmed" : eligibility_status === "UNCERTAIN" ? "Needs confirmation" : "Not eligible" },
    { label: "Mode", reason: getEvidence("mode") },
    { label: "Deadline", reason: getEvidence("deadline") }
  ].filter(item => item.reason);

  const displayMode = opportunity.mode === "OFFLINE" ? "Offline" : opportunity.mode === "ONLINE" ? "Online" : "Mode not specified";
  const locationTag = opportunity.location ? opportunity.location : displayMode === "Offline" ? "Location not specified" : displayMode;
  const deadlineTag = opportunity.deadline ? formatDeadline(opportunity.deadline) : "Deadline not available";

  return (
    <div className="surface-premium rounded-2xl p-8 xl:p-10 flex flex-col xl:flex-row gap-10 xl:gap-16 mb-8 group">

      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-teal-400/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-teal-400/15 transition-colors duration-1000" />

      {/* LEFT: DETAILS */}
      <div className="flex-1 min-w-0 relative z-10 flex flex-col">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-navy-800 border border-navy-700 flex items-center justify-center shrink-0 shadow-inner">
            <span className="text-[10px] font-bold text-ink-muted">{opportunity.organizer.slice(0,1).toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
            <span className="text-ink">{opportunity.category}</span>
            <span className="text-navy-700">&middot;</span>
            <span>{opportunity.organizer}</span>
          </div>
        </div>

        <h3 className="text-3xl lg:text-4xl font-display font-semibold text-ink mb-5 tracking-tight">{opportunity.title}</h3>

        <p className="text-[15px] leading-relaxed text-ink-muted mb-8 line-clamp-3 max-w-2xl">
          {opportunity.description}
        </p>

        <div className="flex flex-col gap-3 mb-10 text-[14px] text-ink-muted">
          {safeReasons.slice(0, 3).map((r, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-teal-400 mt-0.5 opacity-80">✓</span>
              <span>{r}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-4">
          <a
            href={opportunity.registration_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-ink text-navy-950 px-6 py-2.5 rounded-lg text-[14px] font-semibold transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-4px_rgba(255,255,255,0.15)] active:scale-95"
          >
            View opportunity
          </a>
          <button
            onClick={() => onToggleBookmark(opportunity.id)}
            disabled={toggling}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[14px] font-semibold border transition-all hover:-translate-y-0.5 active:scale-95 ${
              isBookmarked
                ? "bg-teal-400/10 border-teal-400/20 text-teal-400"
                : "border-navy-700 bg-navy-900/50 text-ink-muted hover:border-navy-600 hover:text-ink hover:bg-navy-800"
            } disabled:opacity-50`}
          >
            {isBookmarked ? "Saved" : "Save for later"}
          </button>

          <div className="ml-auto flex items-center gap-3 text-[12px] font-medium text-ink-faint">
            <span className="bg-navy-950/50 border border-navy-800 px-3 py-1.5 rounded-md backdrop-blur-sm">{locationTag}</span>
            <span className="bg-navy-950/50 border border-navy-800 px-3 py-1.5 rounded-md backdrop-blur-sm">{deadlineTag}</span>
          </div>
        </div>
      </div>

      {/* RIGHT: MATCH INTELLIGENCE */}
      <div className="w-full xl:w-[280px] shrink-0 xl:border-l border-navy-800/60 pt-8 xl:pt-0 xl:pl-10 relative z-10">

        {/* Animated Score Ring */}
        <div className="mb-10 flex items-center gap-5">
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-navy-800" strokeWidth="6" />
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="currentColor"
                className="text-teal-400 transition-all duration-1000 ease-out"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * animatedScore) / 100}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-2xl font-display font-bold text-ink">{animatedScore}</span>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-semibold tracking-[0.2em] text-teal-400 uppercase mb-1">Match Score</h4>
            <p className="text-[12px] text-ink-muted leading-snug">Highly relevant based on your profile.</p>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-semibold tracking-[0.2em] text-ink-faint uppercase mb-5">Match Evidence</h4>
          <div className="flex flex-col gap-4">
            {evidenceList.map((item, idx) => (
              <div key={idx} className="flex flex-col text-[13px] border-b border-navy-800/40 pb-3 last:border-0 last:pb-0">
                <span className="text-ink-faint mb-1 font-medium">{item.label}</span>
                <span className="text-ink leading-relaxed">{item.reason}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
