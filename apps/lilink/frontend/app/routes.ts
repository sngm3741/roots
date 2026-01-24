import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("", "routes/index.tsx"),
  route("test", "routes/test.tsx"),
  route(":slug", "routes/$slug.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
