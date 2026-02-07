import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("api/hello", "routes/api.hello.ts"),
  route("stores", "routes/stores.tsx"),
  route("stores/:id", "routes/stores.$id.tsx"),
  route("surveys", "routes/surveys.tsx"),
  route("surveys/:id", "routes/surveys.$id.tsx"),
  route("messages/:id", "routes/messages.$id.tsx"),
  route("bookmarks", "routes/bookmarks.tsx"),
  route("rag", "routes/rag.tsx"),
  route("surveys/new", "routes/surveys.new.tsx"),
  route("new", "routes/new.tsx"),
  route("contact", "routes/contact.tsx"),
  route("faq", "routes/faq.tsx"),
  route("company", "routes/company.tsx"),
  route("stories", "routes/stories.tsx"),
  route("privacy", "routes/privacy.tsx"),
  route("terms", "routes/terms.tsx"),
  route("guideline", "routes/guideline.tsx"),
  route("tokushoho", "routes/tokushoho.tsx"),
  route("admin/stores", "routes/admin.stores.tsx"),
] satisfies RouteConfig;
