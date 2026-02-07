export type Language = "ja" | "en";

export type I18nKey =
  | "nav.home"
  | "nav.notes"
  | "notes.title"
  | "notes.backToTop"
  | "notes.backToList"
  | "note.notFound"
  | "note.backToList"
  | "note.backToTop"
  | "section.services"
  | "section.portfolio"
  | "section.log"
  | "log.filter.writing"
  | "log.filter.release"
  | "log.filter.misc"
  | "log.label.published"
  | "log.label.release"
  | "log.label.newOss"
  | "portfolio.cost.dev"
  | "portfolio.cost.ops"
  | "portfolio.cost.delivery"
  | "portfolio.cost.other";

type Dictionary = Record<I18nKey, string>;

export const dictionaries: Record<Language, Dictionary> = {
  ja: {
    "nav.home": "Home",
    "nav.notes": "Notes",
    "notes.title": "Notes",
    "notes.backToTop": "トップへ戻る",
    "notes.backToList": "Notes一覧へ",
    "note.notFound": "記事が見つかりません。",
    "note.backToList": "一覧へ戻る",
    "note.backToTop": "Topへ戻る",
    "section.services": "事業内容",
    "section.portfolio": "過去の開発実績",
    "section.log": "ログ",
    "log.filter.writing": "Writing",
    "log.filter.release": "Release",
    "log.filter.misc": "Misc",
    "log.label.published": "{site} に記事を公開",
    "log.label.release": "リリース",
    "log.label.newOss": "New OSS project",
    "portfolio.cost.dev": "開発費",
    "portfolio.cost.ops": "管理費",
    "portfolio.cost.delivery": "納品までの期間",
    "portfolio.cost.other": "その他",
  },
  en: {
    "nav.home": "Home",
    "nav.notes": "Notes",
    "notes.title": "Notes",
    "notes.backToTop": "Back to Top",
    "notes.backToList": "Back to Notes",
    "note.notFound": "Article not found.",
    "note.backToList": "Back to Notes",
    "note.backToTop": "Back to Top",
    "section.services": "Services",
    "section.portfolio": "Portfolio",
    "section.log": "Log",
    "log.filter.writing": "Writing",
    "log.filter.release": "Release",
    "log.filter.misc": "Misc",
    "log.label.published": "Published on {site}",
    "log.label.release": "Release",
    "log.label.newOss": "New OSS project",
    "portfolio.cost.dev": "Dev cost",
    "portfolio.cost.ops": "Ops cost",
    "portfolio.cost.delivery": "Delivery",
    "portfolio.cost.other": "Other",
  },
};
