import type { Profile } from "../types/profile";

const profiles: Profile[] = [
  {
    slug: "kiriko",
    name: "きりこ",
    subtitle: "日本一のスパンカー❤️",
    avatarUrl:
      "https://cdn.bsky.app/img/avatar/plain/did:plc:4myhksrgvt52kg4yeop34oic/bafkreiha4yvmkiyvhx6q5u35lal7tshf2loms6gov64sy5gonqvcetnywy@jpeg",
    backgroundImageUrl:
      "https://as2.ftcdn.net/jpg/06/51/57/53/1000_F_651575394_at1v8IC3iPwdaiVIlUgt6JDqQMPOyl1W.jpg",
    chatbotEnabled: true,
    socialLinks: [
      {
        id: "x-kirikoallin",
        kind: "x",
        url: "https://x.com/Kirikoallin",
        handle: "@Kirikoallin",
        description: "メイン",
      },
      {
        id: "x-kirikomovie",
        kind: "x",
        url: "https://x.com/kirikomovie",
        handle: "@kirikomovie",
        description: "動画紹介",
      },
      {
        id: "x-osioki_bar",
        kind: "x",
        url: "https://x.com/osioki_bar",
        handle: "@osioki_bar",
        description: "お仕置きBAR",
      },
      {
        id: "bsky-kiriko.studio-allin.com",
        kind: "bluesky",
        url: "https://bsky.app/profile/kiriko.studio-allin.com",
        handle: "@kiriko.studio-allin.com",
        description: "メイン",
      },
      {
        id: "bsky-kirikomovie",
        kind: "bluesky",
        url: "https://bsky.app/profile/kirikomovie.bsky.social",
        handle: "@kirikomovie.bsky.social",
        description: "動画紹介",
      },
    ],
    links: [
      {
        id: "kiriko-1",
        title: "ブログ",
        description: "日々のプレイ日記とイベント情報はこちら",
        url: "https://kiriko07.blog.fc2.com/",
        iconUrl:
        // https://kiriko07.blog.fc2.com/favicon.ico  
        "https://blog-imgs-113.fc2.com/o/o/p/oops0011/2019-09-14-fc2-logo386-comp.png",
      },
      {
        id: "spanking-library",
        title: "スパンキング動画",
        description: "最新動画の一覧はこちら",
        url: "https://spankinglibrary.com/store.php?id=738",
        iconUrl: "https://spankinglibrary.com/favicon.ico",
      },
    ],
  },
];

const profileBySlug = new Map(profiles.map((profile) => [profile.slug, profile]));

export const getProfileBySlug = (slug: string) => profileBySlug.get(slug) ?? null;
