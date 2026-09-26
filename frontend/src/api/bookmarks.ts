import { api } from "./client";
import type { Bookmark } from "../types/bookmark";

export async function getMyBookmarks(): Promise<Bookmark[]> {
  return api.get<Bookmark[]>("/bookmarks");
}

export async function addBookmark(opportunityId: number): Promise<Bookmark> {
  return api.post<Bookmark>(`/opportunities/${opportunityId}/bookmark`, {});
}

export async function removeBookmark(opportunityId: number): Promise<void> {
  return api.delete<void>(`/opportunities/${opportunityId}/bookmark`);
}