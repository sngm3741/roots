export type PortfolioItem = {
  id: number;
  image?: string;
  url?: string;
  title: string;
  description: string;
  role?: string;
  period?: string;
  tech: string[];
  result?: string;
  delivery: string;
  devCost: string;
  opsCost: string;
  other: string;
  accent: string;
};

export const items: PortfolioItem[] = [
  {
    id: 1,
    image: "/ogp.png",
    url: "https://makoto-club.com",
    title: "ナイトワーカーの口コミサイト",
    description: "WEB開発・保守改修 + SNS運用",
    period: "1ヶ月",
    tech: ["Cloudflare", "React"],
    delivery: "1ヶ月",
    devCost: "¥0",
    opsCost: "¥60,000/月",
    other: "運用設計・保守",
    accent: "accent-amber",
  },
  {
    id: 2,
    image: "https://picsum.photos/seed/portfolio-2/800/450",
    url: "https://example-inventory-app.com",
    title: "業務アプリ｜在庫・発注管理",
    description: "現場ヒアリングから導入、権限設計と運用改善まで担当。",
    role: "個人事業主 / 要件整理・設計・実装",
    period: "2ヶ月",
    tech: ["React", "Vite", "Supabase", "Zod"],
    result: "手作業集計を削減、月次作業時間を大幅短縮。",
    delivery: "2ヶ月",
    devCost: "¥800,000",
    opsCost: "¥40,000/月",
    other: "権限設計・運用設計",
    accent: "accent-blue",
  },
  {
    id: 3,
    image: "https://picsum.photos/seed/portfolio-3/800/450",
    url: "https://example-matching-app.com",
    title: "スマホアプリ｜イベント同行マッチング",
    description: "Flutter + Firebase。通知・チャット・決済連携を実装。",
    role: "個人事業主 / モバイルアプリ開発",
    period: "4ヶ月",
    tech: ["Flutter", "Firebase", "Cloud Functions"],
    result: "MVPを短期リリース、初期ユーザー獲得を支援。",
    delivery: "4ヶ月",
    devCost: "¥1,500,000",
    opsCost: "¥80,000/月",
    other: "通知/チャット/決済連携",
    accent: "accent-pink",
  },
  {
    id: 4,
    image: "https://picsum.photos/seed/portfolio-4/800/450",
    url: "https://example-brand-site.com",
    title: "LP/ブランドサイト｜高速表示 & SEO",
    description: "デザインから実装まで一気通貫、Core Web Vitals改善。",
    role: "個人事業主 / デザイン・実装",
    period: "1ヶ月",
    tech: ["Astro", "Tailwind CSS", "Cloudflare Pages"],
    result: "表示速度の改善と検索流入の底上げ。",
    delivery: "1ヶ月",
    devCost: "¥400,000",
    opsCost: "¥15,000/月",
    other: "SEO/計測/保守",
    accent: "accent-emerald",
  },
  {
    id: 5,
    image: "/service01.png",
    title: "第12回農業Week 出展アプリ",
    description:
      "農家と販売店の需給調整をリアルタイム最適化。QRコードで生産者から小売までのトレーサビリティを可視化。",
    period: "1.5ヶ月",
    tech: ["Java", "Spring", "React"],
    delivery: "1.5ヶ月",
    devCost: "¥700,000",
    opsCost: "¥0",
    other: "なし",
    accent: "accent-blue",
  },
  {
    id: 6,
    url: "https://main.kusakari-frontend.pages.dev",
    title: "草刈り事業者のLP制作",
    description: "企業向けLPを短納期で設計・実装。",
    role: "個人事業主 / 企画・デザイン・実装",
    period: "3日",
    tech: ["React", "Cloudflare Pages"],
    delivery: "納品まで3日",
    devCost: "¥0",
    opsCost: "¥10,000/月",
    other: "なし",
    accent: "accent-emerald",
  },
];
