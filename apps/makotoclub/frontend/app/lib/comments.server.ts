import { apiClient } from "./api.server";
import type {
  StoreComment,
  StoreCommentDetail,
  StoreCommentListResponse,
} from "../types/comment";

export async function fetchStoreComments(
  env: { API_BASE_URL?: string },
  storeId: string,
  params: { page?: number; limit?: number } = {},
) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  const query = search.toString();
  const path = `/api/stores/${storeId}/comments${query ? `?${query}` : ""}`;
  return apiClient.fetchJson<StoreCommentListResponse>(path, env);
}

export async function fetchStoreCommentDetail(env: { API_BASE_URL?: string }, id: string) {
  return apiClient.fetchJson<StoreCommentDetail>(`/api/comments/${id}`, env);
}
