import type { Opportunity } from "./opportunity";

export interface ScoreBreakdown {
  skill_score: number;
  eligibility_score: number;
  interest_score: number;
  deadline_score: number;
  mode_score: number;
}

export interface Recommendation {
  opportunity: Opportunity;
  match_score: number;
  eligibility_status: "ELIGIBLE" | "NOT_ELIGIBLE" | "UNCERTAIN";
  reasons: string[];
  score_breakdown: ScoreBreakdown;
}