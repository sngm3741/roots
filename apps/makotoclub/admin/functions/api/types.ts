export type PagesFunction = (context: {
  request: Request;
  params?: Record<string, string>;
}) => Promise<Response> | Response;
