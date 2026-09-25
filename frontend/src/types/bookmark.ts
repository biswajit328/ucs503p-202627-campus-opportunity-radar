import type { Opportunity } from "./opportunity";

export interface Bookmark {
  id: number;
  opportunity_id: number;
  created_at: string;
  opportunity: Opportunity;
}