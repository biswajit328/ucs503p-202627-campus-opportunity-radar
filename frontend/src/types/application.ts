import type { Opportunity } from "./opportunity";

export const APPLICATION_STATUSES = [
  "SAVED",
  "PREPARING",
  "APPLIED",
  "SHORTLISTED",
  "SELECTED",
  "REJECTED",
  "WITHDRAWN",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface Application {
  id: number;
  opportunity_id: number;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  opportunity: Opportunity;
}
