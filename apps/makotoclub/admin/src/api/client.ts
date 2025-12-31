import { AccessLogEntry, Store, StorePayload, Survey, SurveyPayload } from "../types";

type ListResponse<T> = { items: T[]; total: number };

const fetchJson = async <T>(input: RequestInfo | URL, init?: RequestInit) => {
  const res = await fetch(input, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
};

export const adminApi = {
  listStores: () => fetchJson<ListResponse<Store>>("/api/stores"),
  getStore: (id: string) => fetchJson<Store>(`/api/stores/${id}`),
  createStore: (payload: StorePayload) =>
    fetchJson<Store>("/api/stores", { method: "POST", body: JSON.stringify(payload) }),
  updateStore: (id: string, payload: Partial<StorePayload>) =>
    fetchJson<Store>(`/api/stores/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteStore: (id: string) => fetchJson<{ success: boolean }>(`/api/stores/${id}`, { method: "DELETE" }),

  listSurveys: (status?: string) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return fetchJson<ListResponse<Survey>>(`/api/surveys${query}`);
  },
  getSurvey: (id: string) => fetchJson<Survey>(`/api/surveys/${id}`),
  createSurvey: (payload: SurveyPayload) =>
    fetchJson<Survey>("/api/surveys", { method: "POST", body: JSON.stringify(payload) }),
  updateSurvey: (id: string, payload: Partial<SurveyPayload>) =>
    fetchJson<Survey>(`/api/surveys/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteSurvey: (id: string) => fetchJson<{ success: boolean }>(`/api/surveys/${id}`, { method: "DELETE" }),
  listDraftSurveys: () => fetchJson<ListResponse<Survey>>("/api/surveys/drafts"),
  listAccessLogs: (page = 1, limit = 50) =>
    fetchJson<ListResponse<AccessLogEntry>>(`/api/access-logs?page=${page}&limit=${limit}`),
};
