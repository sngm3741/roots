export type NavItem = {
  label: string;
  path: string;
};

export type MobileNavItem = NavItem & {
  hasSubmenu?: boolean;
  submenu?: NavItem[];
};

export type SitemapItem = NavItem & {
  children: NavItem[];
};

export const headerNavItems: NavItem[] = [
  { label: "サービス内容", path: "/services" },
  { label: "料金プラン", path: "/pricing" },
  { label: "施工事例", path: "/works" },
  { label: "対応エリア", path: "/area" },
  { label: "当社の強み", path: "/strengths" },
  { label: "よくある質問", path: "/faq" },
];

export const mobileNavItems: MobileNavItem[] = [
  { label: "TOP", path: "/" },
  { label: "サービス内容", path: "/services" },
  { label: "当社の強み", path: "/strengths" },
  { label: "料金プラン", path: "/pricing" },
  { label: "よくある質問", path: "/faq" },
  { label: "施工事例", path: "/works" },
  { label: "対応エリア", path: "/area" },
  { label: "お客様の声", path: "/reviews" },
  { label: "ブログ", path: "/blog" },
  { label: "コラム", path: "/column" },
  { label: "採用情報", path: "/recruit" },
  { label: "お問い合わせ", path: "/contact" },
  { label: "会社概要", path: "/company" },
  { label: "プライバシーポリシー", path: "/privacy" },
  { label: "サイトマップ", path: "/sitemap" },
];

export const footerLinks: NavItem[] = [
  { label: "TOP", path: "/" },
  { label: "サービス内容", path: "/services" },
  { label: "当社の強み", path: "/strengths" },
  { label: "料金プラン", path: "/pricing" },
  { label: "よくある質問", path: "/faq" },
  { label: "施工事例", path: "/works" },
  { label: "対応エリア", path: "/area" },
  { label: "お客様の声", path: "/reviews" },
  { label: "ブログ", path: "/blog" },
  { label: "コラム", path: "/column" },
  { label: "採用情報", path: "/recruit" },
  { label: "お問い合わせ", path: "/contact" },
  { label: "会社概要", path: "/company" },
  { label: "プライバシーポリシー", path: "/privacy" },
  { label: "サイトマップ", path: "/sitemap" },
];

export const sitemapItems: SitemapItem[] = [
  {
    label: "TOP",
    path: "/",
    children: [],
  },
  {
    label: "サービス内容",
    path: "/services",
    children: [],
  },
  {
    label: "当社の強み",
    path: "/strengths",
    children: [],
  },
  {
    label: "料金プラン",
    path: "/pricing",
    children: [],
  },
  {
    label: "よくある質問",
    path: "/faq",
    children: [],
  },
  {
    label: "施工事例",
    path: "/works",
    children: [],
  },
  {
    label: "対応エリア",
    path: "/area",
    children: [],
  },
  {
    label: "お客様の声",
    path: "/reviews",
    children: [],
  },
  {
    label: "ブログ",
    path: "/blog",
    children: [],
  },
  {
    label: "コラム",
    path: "/column",
    children: [],
  },
  {
    label: "採用情報",
    path: "/recruit",
    children: [],
  },
  {
    label: "お問い合わせ",
    path: "/contact",
    children: [],
  },
  {
    label: "会社概要",
    path: "/company",
    children: [],
  },
  {
    label: "プライバシーポリシー",
    path: "/privacy",
    children: [],
  },
  {
    label: "サイトマップ",
    path: "/sitemap",
    children: [],
  },
];
