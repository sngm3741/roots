import type { Language } from "./i18n";

export type ServiceGroup = {
  title: string;
  items: string[];
};

const servicesJa: ServiceGroup[] = [
  {
    title: "ソフトウェア開発・運用管理",
    items: ["WEB・スマホアプリ開発", "API開発", "LLM・RAG（AIアプリ）開発"],
  },
  {
    title: "マーケティング支援・企画運営",
    items: [
      "WEB+SNSの連携をフル活用",
      "SNS運用管理（投稿含む）",
      "Youtube等の企画・撮影・編集",
    ],
  },
];

const servicesEn: ServiceGroup[] = [
  {
    title: "Software Development & Operations",
    items: ["Web & Mobile apps", "API development", "LLM / RAG (AI apps)"],
  },
  {
    title: "Marketing & Growth Support",
    items: ["Web + SNS integrated campaigns", "SNS operation (incl. posting)", "YouTube planning & editing"],
  },
];

export const getServiceGroups = (lang: Language) => (lang === "en" ? servicesEn : servicesJa);
