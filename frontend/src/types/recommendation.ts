import type { Opportunity } from "./opportunity";

export interface Recommendation {
  opportunity: Opportunity;
  match_score: number;
  eligibility_status: "ELIGIBLE" | "NOT_ELIGIBLE" | "UNCERTAIN";
  reasons: string[];
}