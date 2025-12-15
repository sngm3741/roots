import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("api/hello", "routes/api.hello.ts"),
  route("stores", "routes/stores.tsx"),
  route("stores/:id", "routes/stores.$id.tsx"),
  route("surveys", "routes/surveys.tsx"),
  route("surveys/:id", "routes/surveys.$id.tsx"),
  route("surveys/new", "routes/surveys.new.tsx"),
  route("admin/stores", "routes/admin.stores.tsx"),
] satisfies RouteConfig;
