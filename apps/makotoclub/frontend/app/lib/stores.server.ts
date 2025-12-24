import { apiClient } from "./api.server";
import type { StoreDetail, StoreListResponse } from "../types/store";
import type { SurveySummary } from "../types/survey";

type StoreSearchParams = {
  prefecture?: string;
  area?: string;
  industry?: string;
  genre?: string;
  name?: string;
  page?: number;
  limit?: number;
  sort?: string;
  spec?: number;
  age?: number;
};

export async function fetchStores(env: { API_BASE_URL?: string }, params: StoreSearchParams = {}) {
  const search = new URLSearchParams();
  if (params.prefecture) search.set("prefecture", params.prefecture);
  if (params.area) search.set("area", params.area);
  if (params.industry) search.set("industry", params.industry);
  if (params.genre) search.set("genre", params.genre);
  if (params.name) search.set("name", params.name);
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.sort) search.set("sort", params.sort);
  if (typeof params.spec === "number") search.set("spec", String(params.spec));
  if (typeof params.age === "number") search.set("age", String(params.age));

  return apiClient.fetchJson<StoreListResponse>(`/api/stores?${search.toString()}`, env);
}

export async function fetchStoreDetail(env: { API_BASE_URL?: string }, storeId: string) {
  return apiClient.fetchJson<StoreDetail>(`/api/stores/${storeId}`, env);
}

export async function fetchStoreSurveys(env: { API_BASE_URL?: string }, storeId: string, limit = 50) {
  return apiClient.fetchJson<SurveySummary[]>(
    `/api/stores/${storeId}/surveys?limit=${limit}`,
    env,
  );
}
