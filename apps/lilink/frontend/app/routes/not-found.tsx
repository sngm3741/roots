import type { Route } from "./+types/not-found";
import { NotFoundView } from "~/components/profile/NotFoundView";

export const loader: Route.LoaderFunction = () => {
  throw new Response("ページが見つかりません。", { status: 404 });
};

export default function NotFoundRoute() {
  return <NotFoundView />;
}

export function ErrorBoundary() {
  return <NotFoundView />;
}
