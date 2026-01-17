import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { Route } from "./+types/root";
import "./app.css";
import { NotFoundView } from "./components/profile/NotFoundView";

export const meta: Route.MetaFunction = () => [
  { title: "lilink" },
  { name: "description", content: "リンク集プロフィールページ" },
];

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="text-[15px] text-lilink-ink">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundView />;
  }

  const message = isRouteErrorResponse(error)
    ? "表示に失敗しました。"
    : "予期しないエラーが発生しました。";

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto w-full max-w-5xl">
        <div className="grid grid-cols-12 gap-6 text-center">
          <div className="col-span-12 md:col-start-3 md:col-span-8">
            <div className="grid grid-cols-12 gap-4">
              <p className="col-span-12 text-sm tracking-[0.3em] text-lilink-muted">
                エラー
              </p>
              <h1 className="col-span-12 text-2xl font-semibold">
                {message}
              </h1>
              <p className="col-span-12 text-sm text-lilink-muted">
                お手数ですが、時間をおいてもう一度お試しください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
