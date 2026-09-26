import { api } from "./client";
import type { Recommendation } from "../types/recommendation";

export async function getRecommendations(limit = 20): Promise<Recommendation[]> {
  return api.get<Recommendation[]>(`/recommendations?limit=${limit}`);
}