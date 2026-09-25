export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Submission {
  id: number;
  review_status: SubmissionStatus;
  submitted_at: string;
}

export interface ExtractedOpportunity {
  title: string;
  category: string;
  organizer: string;
  skills: string[];
  eligible_branches: string[];
  eligible_academic_levels: string[];
  mode: string;
  deadline: string;
  location: string;
  is_uncertain: boolean;
  uncertainty_notes: string;
}

export interface ExtractionReview {
  needs_review: boolean;
  issues: string[];
  parsed_deadline: string | null;
}

export interface SubmissionReview extends Submission {
  raw_text: string;
  extracted: ExtractedOpportunity | null;
  review: ExtractionReview | null;
}
