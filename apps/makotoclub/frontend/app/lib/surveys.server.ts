import { apiClient } from "./api.server";
import type { SurveyDetail, SurveyListResponse } from "../types/survey";

type SurveySearchParams = {
  sort?: string;
  limit?: number;
  page?: number;
};

export async function fetchSurveys(env: { API_BASE_URL?: string }, params: SurveySearchParams = {}) {
  const search = new URLSearchParams();
  if (params.sort) search.set("sort", params.sort);
  if (params.limit) search.set("limit", String(params.limit));
  if (params.page) search.set("page", String(params.page));
  return apiClient.fetchJson<SurveyListResponse>(`/api/surveys?${search.toString()}`, env);
}

export async function fetchSurveyDetail(env: { API_BASE_URL?: string }, id: string) {
  return apiClient.fetchJson<SurveyDetail>(`/api/surveys/${id}`, env);
}
