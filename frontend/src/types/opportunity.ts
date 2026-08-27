export interface OpportunityEligibility {
  eligible_branches: string[];
  eligible_semesters: number[];
  is_uncertain: boolean;
}

export interface Opportunity {
  id: number;
  title: string;
  description: string;
  category: string;
  organizer: string;
  deadline: string;
  start_date: string | null;
  duration: string | null;
  location: string | null;
  mode: "ONLINE" | "OFFLINE" | "HYBRID";
  registration_url: string;
  source_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  skills: string[];
  eligibility: OpportunityEligibility | null;
}

export interface OpportunitySearchParams {
  keyword?: string;
  category?: string;
  skill?: string;
  branch?: string;
  semester?: number;
  mode?: string;
  location?: string;
}