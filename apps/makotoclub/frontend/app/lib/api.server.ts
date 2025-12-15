import { getApiBaseUrl } from "../config.server";

type FetchOptions = {
  signal?: AbortSignal;
};

async function fetchJson<T>(path: string, env: { API_BASE_URL?: string }, opts: FetchOptions = {}) {
  const base = getApiBaseUrl(env);
  const url = new URL(path, base);

  const res = await fetch(url, { signal: opts.signal });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText} (${url.toString()})`);
  }
  return (await res.json()) as T;
}

export const apiClient = {
  fetchJson,
};
