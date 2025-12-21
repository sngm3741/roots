import type { Env } from "./lib/mapper";

export type PagesFunction = (context: {
  request: Request;
  params?: Record<string, string>;
  env: Env;
}) => Promise<Response> | Response;
