import { isRouteErrorResponse } from "react-router";
import type { Route } from "./+types/index";
import { ProfilePage } from "~/components/profile/ProfilePage";
import { NotFoundView } from "~/components/profile/NotFoundView";
import { getProfileBySlug } from "~/data/profiles";

const DOMAIN_SUFFIX = ".lilink.link";

const getSlugFromHost = (hostname: string) => {
  if (hostname.endsWith(DOMAIN_SUFFIX)) {
    const slug = hostname.slice(0, -DOMAIN_SUFFIX.length);
    return slug.length > 0 ? slug : null;
  }
  return null;
};

const getHostnameFromRequest = (request: Request) => {
  return (
    request.headers.get("x-forwarded-host") ??
    request.headers.get("cf-connecting-host") ??
    new URL(request.url).hostname
  );
};

export const loader: Route.LoaderFunction = ({ request }) => {
  const hostname = getHostnameFromRequest(request);
  const slug = getSlugFromHost(hostname);

  if (!slug) {
    throw new Response("プロフィールが見つかりません。", { status: 404 });
  }

  const profile = getProfileBySlug(slug);
  if (!profile) {
    throw new Response("プロフィールが見つかりません。", { status: 404 });
  }

  return { profile };
};

export default function IndexRoute({ loaderData }: Route.ComponentProps) {
  const { profile } = loaderData;
  return <ProfilePage profile={profile} />;
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
