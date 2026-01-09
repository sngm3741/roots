import { isRouteErrorResponse } from "react-router";
import type { Route } from "./+types/$slug";
import { ProfileHeader } from "~/components/profile/ProfileHeader";
import { SocialLinks } from "~/components/profile/SocialLinks";
import { LinkList } from "~/components/profile/LinkList";
import { NotFoundView } from "~/components/profile/NotFoundView";
import { getProfileBySlug } from "~/data/profiles";

export const meta: Route.MetaFunction = ({ data }) => {
  if (!data?.profile) {
    return [{ title: "lilink" }];
  }

  const title = `${data.profile.name} | lilink`;
  const description = data.profile.subtitle ?? "リンク集プロフィールページ";

  return [
    { title },
    { name: "description", content: description },
  ];
};

export const loader: Route.LoaderFunction = ({ params }) => {
  const slug = params.slug;
  if (!slug) {
    throw new Response("プロフィールが見つかりません。", { status: 404 });
  }

  const profile = getProfileBySlug(slug);
  if (!profile) {
    throw new Response("プロフィールが見つかりません。", { status: 404 });
  }

  return { profile };
};

export default function ProfileRoute({ loaderData }: Route.ComponentProps) {
  const { profile } = loaderData;

  return (
    <main className="min-h-screen px-6 pb-16 pt-12">
      <div className="mx-auto grid w-full max-w-md gap-8">
        <ProfileHeader
          name={profile.name}
          subtitle={profile.subtitle}
          avatarUrl={profile.avatarUrl}
        />
        <SocialLinks socialLinks={profile.socialLinks} />
        <LinkList links={profile.links} />
      </div>
    </main>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundView />;
  }

  return (
    <main className="grid min-h-screen place-items-center px-6 py-16">
      <div className="grid w-full max-w-md gap-4 text-center">
        <p className="text-xs tracking-[0.5em] text-lilink-muted">エラー</p>
        <h1 className="text-2xl font-semibold">表示に失敗しました</h1>
        <p className="text-sm text-lilink-muted">
          お手数ですが、時間をおいてもう一度お試しください。
        </p>
      </div>
    </main>
  );
}
