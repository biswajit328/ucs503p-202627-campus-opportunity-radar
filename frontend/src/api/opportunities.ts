import { api } from "./client";
import type { Opportunity, OpportunitySearchParams } from "../types/opportunity";

export async function searchOpportunities(params: OpportunitySearchParams): Promise<Opportunity[]> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });
  const queryString = query.toString();
  return api.get<Opportunity[]>(`/opportunities/search${queryString ? `?${queryString}` : ""}`);
}