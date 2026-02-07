import { useMemo, useState } from "react";
import { Play, Share2 } from "lucide-react";
import type { EventItem, PageData } from "~/types/profile";
import { Grid12 } from "~/components/atoms/Grid12";
import { Col } from "~/components/atoms/Col";
import { EventCard } from "~/components/organisms/EventCard";
import { getSocialIconUrl } from "~/components/atoms/socialIcons";

type UserPageProps = {
  page: PageData;
};

type UserTab = "articles" | "activity" | "about";

type ArticleItem = {
  id: string;
  title: string;
  image: string;
  url?: string;
};

const TEXT_OUTLINE = {
  textShadow:
    "0 1px 0 #000, 0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000",
};

const getSocialHandle = (url: string) => {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.replace(/^\/+/, "").split("/");
    const hostname = parsed.hostname;
    if (hostname.includes("bsky.app") && pathParts[0] === "profile") {
      const handle = pathParts[1];
      return handle ? `@${handle}` : url;
    }
    const handle = pathParts[0];
    return handle ? `@${handle}` : url;
  } catch {
    return url;
  }
};

const LocationIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 512 512"
    aria-hidden="true"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="#DF5656"
      d="M256,0C160.798,0,83.644,77.155,83.644,172.356c0,97.162,48.158,117.862,101.386,182.495
		C248.696,432.161,256,512,256,512s7.304-79.839,70.97-157.148c53.228-64.634,101.386-85.334,101.386-182.495
		C428.356,77.155,351.202,0,256,0z M256,231.921c-32.897,0-59.564-26.668-59.564-59.564s26.668-59.564,59.564-59.564
		c32.896,0,59.564,26.668,59.564,59.564S288.896,231.921,256,231.921z"
    />
  </svg>
);


const DEFAULT_ARTICLE_IMAGE =
  "https://images.unsplash.com/photo-1594873604892-b599f847e859?auto=format&fit=crop&w=300&q=80";
const HEADER_BG_URL = "url(/bgimg.png)";
const FOOTER_BG_URL = "url(/footer.png)";
const HEADER_BG_STYLE = {
  backgroundImage: HEADER_BG_URL,
  backgroundSize: "cover",
  backgroundPosition: "center",
} as const;
const FOOTER_BG_STYLE = {
  backgroundImage: FOOTER_BG_URL,
  backgroundSize: "cover",
  backgroundPosition: "bottom",
} as const;

const buildArticles = (
  items: PageData["links"],
  page: PageData,
): ArticleItem[] =>
  items.map((link) => ({
    id: link.id,
    title: link.title ?? "タイトル未設定",
    image:
      link.imageUrl ??
      link.iconUrl ??
      page.profile.avatarUrl ??
      DEFAULT_ARTICLE_IMAGE,
    url: link.linkUrl ?? link.url,
  }));

export function UserPage({ page }: UserPageProps) {
  const [activeTab, setActiveTab] = useState<UserTab>("articles");
  const [shareCopied, setShareCopied] = useState(false);
  const eventItems = useMemo(
    () => page.optional?.dataByType?.event?.items ?? [],
    [page.optional],
  );
  const blogLinks = useMemo(
    () => page.links.filter((link) => link.category === "blog"),
    [page.links],
  );
  const videoLinks = useMemo(
    () => page.links.filter((link) => link.category === "video"),
    [page.links],
  );
  const blogArticles = useMemo(
    () => buildArticles(blogLinks, page),
    [blogLinks, page],
  );

  const shareTitle = `${page.profile.name} | lilink`;

  const handleShare = async () => {
    const shareUrl =
      typeof window === "undefined"
        ? `https://${page.profile.slug}.lilink.link`
        : window.location.href;
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
        return;
      } catch {
        return;
      }
    }

    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard?.writeText
    ) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareCopied(true);
        window.setTimeout(() => setShareCopied(false), 1500);
      } catch {
        setShareCopied(false);
      }
    }
  };

  return (
    <main
      className="h-[100dvh] overflow-y-auto overscroll-contain bg-slate-100/60"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[375px] flex-col bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <UserHeaderShell>
          <UserProfileHeader page={page} onShare={handleShare} />
          <UserSocialSection page={page} shareCopied={shareCopied} />
        </UserHeaderShell>
        <UserTabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <div className="flex-1">
          {activeTab === "articles" ? (
            <UserEventList
              items={eventItems}
              emptyLabel="イベント情報は準備中です"
            />
          ) : activeTab === "activity" ? (
            <UserArticleList
              items={blogArticles}
              emptyLabel="ブログ記事は準備中です"
            />
          ) : (
            <UserVideoGrid
              items={videoLinks}
              emptyLabel="販売動画は準備中です"
            />
          )}
        </div>
      </div>
    </main>
  );
}

function UserHeaderShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative bg-white">
      <div
        className="absolute inset-0"
        style={{
          ...HEADER_BG_STYLE,
          filter: "saturate(0.7) contrast(0.9) brightness(1.05)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function UserProfileHeader({
  page,
  onShare,
}: {
  page: PageData;
  onShare: () => void;
}) {
  const { profile } = page;
  return (
    <Grid12 gap="4" className="p-4 py-4">
      <Col span={12}>
        <ProfileHeaderRow profile={profile} onShare={onShare} />
      </Col>
    </Grid12>
  );
}

function UserSocialSection({
  page,
  shareCopied,
}: {
  page: PageData;
  shareCopied: boolean;
}) {
  const socialLinks = page.profile.socialLinks ?? [];
  if (!socialLinks.length) {
    return null;
  }

  return (
    <div className="bg-transparent">
      <Grid12 gap="4" className="px-4 pb-4">
        <Col span={12}>
          <SocialGrid links={socialLinks} shareCopied={shareCopied} />
        </Col>
      </Grid12>
    </div>
  );
}

function ProfileHeaderRow({
  profile,
  onShare,
}: {
  profile: PageData["profile"];
  onShare: () => void;
}) {
  return (
    <Grid12 gap="4" className="items-center">
      <Col span={4} className="flex justify-center">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full">
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="h-full w-full object-cover"
          />
        </div>
      </Col>
      <Col span={6}>
        <h1 className="text-3xl font-semibold text-white" style={TEXT_OUTLINE}>
          {profile.name}
        </h1>
        <div
          className="flex items-center gap-2 pt-2 text-lg text-white"
          style={TEXT_OUTLINE}
        >
          <LocationIcon className="h-6 w-6" />
          <span>Studio All-in</span>
        </div>
      </Col>
      <Col span={2} className="flex items-center justify-end">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onShare();
          }}
          className="rounded-full border border-white/60 bg-white/70 p-2 shadow-[0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur transition-colors hover:bg-white/80"
        >
          <Share2 className="h-5 w-5 text-slate-700" />
        </button>
      </Col>
    </Grid12>
  );
}

function SocialGrid({
  links,
  shareCopied,
}: {
  links: PageData["profile"]["socialLinks"];
  shareCopied: boolean;
}) {
  if (!links?.length) {
    return null;
  }
  return (
    <>
      <div className="mx-7 grid grid-cols-3 gap-0 justify-items-stretch">
        {links.slice(0, 9).map((link) => {
          const iconUrl = getSocialIconUrl(link.kind);
          const handle = getSocialHandle(link.url);
          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="grid w-full gap-1 rounded-2xl bg-transparent p-3 text-center transition-colors hover:bg-white/10"
            >
              <span
                className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full ${
                  link.kind === "bluesky"
                    ? "bg-white shadow-sm"
                    : "bg-black"
                }`}
              >
                {iconUrl ? (
                  <img
                    src={iconUrl}
                    alt={link.label ?? link.kind}
                    className="h-5 w-5"
                  />
                ) : (
                  <span className="text-[10px] font-semibold text-white">
                    {link.label ?? link.kind}
                  </span>
                )}
              </span>
              <span
                className="block w-full truncate text-[10px] text-white"
                style={TEXT_OUTLINE}
              >
                {handle}
              </span>
              {link.description ? (
                <span
                  className="block w-full truncate text-xs font-semibold text-white"
                  style={TEXT_OUTLINE}
                >
                  {link.description}
                </span>
              ) : null}
            </a>
          );
        })}
      </div>
      {shareCopied ? (
        <div className="mt-2 text-right text-xs font-semibold text-white/90">
          リンクをコピーしました
        </div>
      ) : null}
    </>
  );
}

function UserTabNavigation({
  activeTab,
  onTabChange,
}: {
  activeTab: UserTab;
  onTabChange: (tab: UserTab) => void;
}) {
  const tabs: { id: UserTab; label: string }[] = [
    { id: "articles", label: "イベント" },
    { id: "activity", label: "ブログ" },
    { id: "about", label: "プレイ動画" },
  ];

  return (
    <Grid12 gap="0" className="border-b border-slate-200 bg-white">
      {tabs.map((tab) => (
        <Col key={tab.id} span={4}>
          <button
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`relative w-full py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-red-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
            {activeTab === tab.id ? (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
            ) : null}
          </button>
        </Col>
      ))}
    </Grid12>
  );
}

function UserArticleList({
  items,
  emptyLabel,
}: {
  items: ArticleItem[];
  emptyLabel: string;
}) {
  if (!items.length) {
    return (
      <div className="px-6 py-8 text-center text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="bg-white">
      {items.map((article) => (
        <UserArticleRow key={article.id} article={article} />
      ))}
    </div>
  );
}

function UserArticleRow({ article }: { article: ArticleItem }) {
  const content = (
    <Grid12 gap="3" className="items-start">
      <Col span={8}>
        <h3 className="mb-1 text-base font-bold text-slate-900">
          {article.title}
        </h3>
      </Col>
      <Col span={4} className="flex justify-end">
        <img
          src={article.image}
          alt={article.title}
          className="h-20 w-20 rounded-lg object-cover"
        />
      </Col>
    </Grid12>
  );

  if (article.url) {
    return (
      <a
        href={article.url}
        target="_blank"
        rel="noreferrer"
        className="block w-full border-b border-slate-100 px-4 py-4 text-left transition-colors hover:bg-slate-50"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="w-full border-b border-slate-100 px-4 py-4 text-left">
      {content}
    </div>
  );
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return null;
  }
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function UserVideoGrid({
  items,
  emptyLabel,
}: {
  items: PageData["links"];
  emptyLabel: string;
}) {
  const previewLimitSeconds = 30;
  const [durations, setDurations] = useState<Record<string, string>>({});
  if (!items.length) {
    return (
      <div className="px-6 py-8 text-center text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="grid grid-cols-2 gap-3">
        {items.map((video) => {
          const thumbnail =
            video.imageUrl ??
            video.iconUrl ??
            DEFAULT_ARTICLE_IMAGE;
          const previewUrl = video.previewUrl;
          const source = video.source ?? "YouTube";
          const durationLabel = durations[video.id] ?? video.duration;
          return (
            <a
              key={video.id}
              href={video.linkUrl ?? video.url ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="group overflow-hidden rounded-2xl bg-slate-900/90 text-white shadow-[0_18px_30px_rgba(15,23,42,0.3)]"
            >
              <div className="relative aspect-video w-full overflow-hidden">
                {previewUrl ? (
                  <video
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    src={previewUrl}
                    poster={video.imageUrl ?? undefined}
                    muted
                    playsInline
                    preload="metadata"
                    autoPlay
                    onLoadedMetadata={(event) => {
                      const current = event.currentTarget;
                      const formatted = formatDuration(current.duration);
                      if (formatted) {
                        setDurations((prev) =>
                          prev[video.id] === formatted
                            ? prev
                            : { ...prev, [video.id]: formatted },
                        );
                      }
                    }}
                    onTimeUpdate={(event) => {
                      const current = event.currentTarget;
                      if (current.currentTime >= previewLimitSeconds) {
                        current.currentTime = 0;
                        current.play().catch(() => undefined);
                      }
                    }}
                  />
                ) : (
                  <img
                    src={thumbnail}
                    alt={video.title ?? "動画"}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-[0_8px_16px_rgba(15,23,42,0.35)]">
                    <Play className="h-5 w-5" />
                  </span>
                </div>
                {durationLabel ? (
                  <span className="absolute bottom-2 right-2 rounded-full bg-black/80 px-2 py-0.5 text-xs font-semibold text-white">
                    {durationLabel}
                  </span>
                ) : null}
              </div>
              <div className="px-3 py-3">
                <p className="text-sm font-semibold text-white">
                  {video.title ?? "タイトル未設定"}
                </p>
                <p className="mt-1 text-xs text-slate-400">{source}</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function UserEventList({
  items,
  emptyLabel,
}: {
  items: EventItem[];
  emptyLabel: string;
}) {
  if (!items.length) {
    return (
      <div className="px-6 py-8 text-center text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="bg-white">
        {items.map((event) => (
          <EventCard
            key={event.id}
            title={event.title}
            dates={event.dates}
            reservationRequired={event.reservationRequired}
            linkUrl={event.linkUrl}
          />
        ))}
    </div>
  );
}
