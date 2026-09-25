import { api } from "./client";
import type { Opportunity } from "../types/opportunity";
import type { Submission, SubmissionReview } from "../types/submission";

export function createSubmission(rawText: string): Promise<Submission> {
  return api.post<Submission>("/submissions", { raw_text: rawText });
}

export function getPendingSubmissions(): Promise<Submission[]> {
  return api.get<Submission[]>("/submissions/pending");
}

export function getSubmissionReview(submissionId: number): Promise<SubmissionReview> {
  return api.get<SubmissionReview>(`/submissions/${submissionId}/review`);
}

export function approveSubmission(submissionId: number): Promise<{ opportunity_id: number }> {
  return api.post<{ opportunity_id: number }>(`/submissions/${submissionId}/approve`, {});
}

export function rejectSubmission(submissionId: number): Promise<Submission> {
  return api.post<Submission>(`/submissions/${submissionId}/reject`, {});
}

export type ApprovedOpportunity = Opportunity;
