import { apiClient } from "./api.server";
import type { SurveyComment, SurveyDetail, SurveyListResponse } from "../types/survey";

type SurveySearchParams = {
  sort?: string;
  limit?: number;
  page?: number;
  name?: string;
  prefecture?: string;
  industry?: string;
  genre?: string;
  spec?: number;
  age?: number;
};

export async function fetchSurveys(env: { API_BASE_URL?: string }, params: SurveySearchParams = {}) {
  const search = new URLSearchParams();
  if (params.sort) search.set("sort", params.sort);
  if (params.limit) search.set("limit", String(params.limit));
  if (params.page) search.set("page", String(params.page));
  if (params.name) search.set("name", params.name);
  if (params.prefecture) search.set("prefecture", params.prefecture);
  if (params.industry) search.set("industry", params.industry);
  if (params.genre) search.set("genre", params.genre);
  if (typeof params.spec === "number") search.set("spec", String(params.spec));
  if (typeof params.age === "number") search.set("age", String(params.age));
  return apiClient.fetchJson<SurveyListResponse>(`/api/surveys?${search.toString()}`, env);
}

export async function fetchSurveyDetail(env: { API_BASE_URL?: string }, id: string) {
  return apiClient.fetchJson<SurveyDetail>(`/api/surveys/${id}`, env);
}

export async function fetchSurveyComments(env: { API_BASE_URL?: string }, id: string) {
  return apiClient.fetchJson<SurveyComment[]>(`/api/surveys/${id}/comments`, env);
}
