import { api } from "./client";
import type { Organization } from "../types/organization";

export function createOrganization(name: string): Promise<Organization> {
  return api.post<Organization>("/organizations", { name });
}
