import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { Toaster } from "sonner";

import type { Route } from "./+types/root";
import "./app.css";

export const meta: Route.MetaFunction = () => {
  const title = "草刈り代行会社 Webサイト";
  const description = "草刈り・除草管理の法人向けサービス紹介ページ";

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
  ];
};

export const links: Route.LinksFunction = () => [];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-white text-gray-900">
        {children}
        <Toaster position="top-center" richColors />
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
  let title = "エラー";
  let detail = "予期しないエラーが発生しました。";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    title = error.status === 404 ? "404" : "エラー";
    detail =
      error.status === 404
        ? "指定されたページが見つかりませんでした。"
        : error.statusText || detail;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    detail = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-screen px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-700">{detail}</p>
        {stack ? (
          <pre className="rounded-lg bg-gray-100 p-4 text-sm text-gray-800">
            <code>{stack}</code>
          </pre>
        ) : null}
      </div>
    </main>
  );
}
