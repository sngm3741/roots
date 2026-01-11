import { apiClient } from "./api.server";
import type { StoreComment, StoreCommentDetail } from "../types/comment";

export async function fetchStoreComments(env: { API_BASE_URL?: string }, storeId: string) {
  return apiClient.fetchJson<StoreComment[]>(`/api/stores/${storeId}/comments`, env);
}

export async function fetchStoreCommentDetail(env: { API_BASE_URL?: string }, id: string) {
  return apiClient.fetchJson<StoreCommentDetail>(`/api/comments/${id}`, env);
}
