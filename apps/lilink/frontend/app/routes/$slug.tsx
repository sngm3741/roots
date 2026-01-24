import { isRouteErrorResponse } from "react-router";
import type { Route } from "./+types/$slug";
import { ProfilePage } from "~/components/templates/ProfilePage";
import { NotFoundView } from "~/components/templates/NotFoundView";
import { getPageBySlug } from "~/data/profiles";

export const meta: Route.MetaFunction = ({ data }) => {
  if (!data?.page) {
    return [{ title: "lilink" }];
  }

  const title = `${data.page.profile.name} | lilink`;
  const description =
    data.page.profile.subtitle ?? "リンク集プロフィールページ";

  return [
    { title },
    { name: "description", content: description },
  ];
};

export const loader: Route.LoaderFunction = async ({ params }) => {
  const slug = params.slug;
  if (!slug) {
    throw new Response("プロフィールが見つかりません。", { status: 404 });
  }

  const page = await getPageBySlug(slug);
  if (!page) {
    throw new Response("プロフィールが見つかりません。", { status: 404 });
  }

  return { page };
};

export default function ProfileRoute({ loaderData }: Route.ComponentProps) {
  const { page } = loaderData;

  return <ProfilePage page={page} />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundView />;
  }

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto w-full max-w-5xl">
        <div className="grid grid-cols-12 gap-6 text-center">
          <div className="col-span-12 md:col-start-3 md:col-span-8">
            <div className="grid grid-cols-12 gap-4">
              <p className="col-span-12 text-xs tracking-[0.5em] text-lilink-muted">
                エラー
              </p>
              <h1 className="col-span-12 text-2xl font-semibold">
                表示に失敗しました
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
