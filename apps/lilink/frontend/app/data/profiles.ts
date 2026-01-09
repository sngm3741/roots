import type { Profile } from "../types/profile";

const profiles: Profile[] = [
  {
    slug: "mika",
    name: "森下 美香",
    subtitle: "フリーランスUIデザイナー",
    avatarUrl:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=400&auto=format&fit=crop",
    socialLinks: [
      { kind: "x", url: "https://x.com/example" },
      { kind: "instagram", url: "https://instagram.com/example" },
      { kind: "website", url: "https://example.com" },
    ],
    links: [
      {
        id: "mika-1",
        title: "ポートフォリオ",
        url: "https://example.com/portfolio",
        iconUrl:
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=120&auto=format&fit=crop",
      },
      {
        id: "mika-2",
        title: "デザイン相談フォーム",
        url: "https://example.com/contact",
      },
      {
        id: "mika-3",
        title: "最近の制作ログ",
        url: "https://example.com/blog",
      },
    ],
  },
  {
    slug: "taichi",
    name: "高橋 太一",
    subtitle: "プロダクトマネージャー / 週末クリエイター",
    avatarUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop",
    socialLinks: [
      { kind: "x", url: "https://x.com/example" },
      { kind: "line", url: "https://line.me/R/ti/p/@example" },
      { kind: "youtube", url: "https://youtube.com/@example" },
      { kind: "website", url: "https://example.com" },
    ],
    links: [
      {
        id: "taichi-1",
        title: "プロフィールと実績",
        url: "https://example.com/about",
        iconUrl:
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=120&auto=format&fit=crop",
      },
      {
        id: "taichi-2",
        title: "プロジェクトの進捗",
        url: "https://example.com/projects",
      },
      {
        id: "taichi-3",
        title: "イベント登壇資料",
        url: "https://example.com/speaking",
      },
      {
        id: "taichi-4",
        title: "コミュニティ参加フォーム",
        url: "https://example.com/community",
      },
      {
        id: "taichi-5",
        title: "週末ニュースレター",
        url: "https://example.com/newsletter",
      },
      {
        id: "taichi-6",
        title: "おすすめツール一覧",
        url: "https://example.com/tools",
      },
      {
        id: "taichi-7",
        title: "読書メモ",
        url: "https://example.com/reading",
      },
      {
        id: "taichi-8",
        title: "チーム募集",
        url: "https://example.com/recruit",
      },
      {
        id: "taichi-9",
        title: "配信アーカイブ",
        url: "https://example.com/archive",
      },
      {
        id: "taichi-10",
        title: "お問い合わせ",
        url: "https://example.com/contact",
      },
    ],
  },
];

const profileBySlug = new Map(profiles.map((profile) => [profile.slug, profile]));

export const getProfileBySlug = (slug: string) => profileBySlug.get(slug) ?? null;
