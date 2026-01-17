import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("services", "routes/services.tsx"),
  route("strengths", "routes/strengths.tsx"),
  route("pricing", "routes/pricing.tsx"),
  route("faq", "routes/faq.tsx"),
  route("works", "routes/works.tsx"),
  route("area", "routes/area.tsx"),
  route("reviews", "routes/reviews.tsx"),
  route("blog", "routes/blog.tsx"),
  route("blog/:slug", "routes/blog.$slug.tsx"),
  route("column", "routes/column.tsx"),
  route("column/:slug", "routes/column.$slug.tsx"),
  route("recruit", "routes/recruit.tsx"),
  route("contact", "routes/contact.tsx"),
  route("company", "routes/company.tsx"),
  route("privacy", "routes/privacy.tsx"),
  route("sitemap", "routes/sitemap.tsx"),
] satisfies RouteConfig;
