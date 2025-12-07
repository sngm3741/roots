type Env = {
  API_BASE_URL?: string;
};

// config_rules.md に従い env は loader/context でのみ参照する。
export function getApiBaseUrl(env: Env, fallback?: string) {
  return (
    env.API_BASE_URL ||
    process.env.API_BASE_URL ||
    process.env.VITE_API_BASE_URL ||
    fallback
  );
}
