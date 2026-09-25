import { api } from "./client";
import type { Application, ApplicationStatus } from "../types/application";

export function getApplications(): Promise<Application[]> {
  return api.get<Application[]>("/applications");
}

export function createApplication(opportunityId: number): Promise<Application> {
  return api.post<Application>("/applications", { opportunity_id: opportunityId });
}

export function updateApplicationStatus(applicationId: number, status: ApplicationStatus): Promise<Application> {
  return api.patch<Application>(`/applications/${applicationId}`, { status });
}
