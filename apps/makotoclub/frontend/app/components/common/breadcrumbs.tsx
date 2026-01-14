import { useLocation, Link } from "react-router";
import { useMemo } from "react";
import { useBreadcrumbOverride } from "./breadcrumb-context";

type Crumb = {
  label: string;
  href?: string;
};

const LABEL_MAP: Record<string, string> = {
  "": "ホーム",
  stores: "店舗一覧",
  surveys: "アンケート一覧",
  new: "新規作成",
  admin: "管理",
  contact: "お問い合わせ",
  privacy: "プライバシーポリシー",
  terms: "利用規約",
  bookmarks: "お気に入り",
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const { lastLabel, lastStoreId, lastDetailLabel } = useBreadcrumbOverride();
  const pathname = location.pathname;

  const crumbs = useMemo<Crumb[]>(() => {
    if (!pathname) return [{ label: "ホーム", href: "/" }];
    if (pathname === "/surveys/new" || pathname === "/new") {
      return [{ label: "ホーム", href: "/" }, { label: "アンケート投稿" }];
    }
    if (/^\/surveys\/[^/]+$/.test(pathname)) {
      return [
        { label: "ホーム", href: "/" },
        {
          label: lastLabel ?? "店舗詳細",
          href: lastStoreId ? `/stores/${lastStoreId}` : undefined,
        },
        { label: "アンケート" },
      ];
    }
    if (/^\/stores\/[^/]+$/.test(pathname)) {
      return [{ label: "ホーム", href: "/" }, { label: lastLabel ?? "店舗詳細" }];
    }
    if (/^\/messages\/[^/]+$/.test(pathname)) {
      return [
        { label: "ホーム", href: "/" },
        {
          label: lastLabel ?? "店舗詳細",
          href: lastStoreId ? `/stores/${lastStoreId}` : undefined,
        },
        { label: lastDetailLabel ?? ">>" },
      ];
    }
    const segments = pathname.split("/").filter(Boolean);
    const items: Crumb[] = [{ label: "ホーム", href: "/" }];
    let currentPath = "";

    segments.forEach((seg, idx) => {
      currentPath += `/${seg}`;
      const isLast = idx === segments.length - 1;
      const parent = segments[idx - 1];
      let label = LABEL_MAP[seg] ?? seg;

      const isDetailSegment = (parent === "stores" || parent === "surveys") && seg !== "new";
      if (isDetailSegment) {
        if (lastLabel) {
          label = lastLabel;
        } else if (parent === "stores") {
          label = "店舗詳細";
        } else if (parent === "surveys") {
          label = "アンケート詳細";
        } else {
          label = "詳細";
        }
      }
      if (seg === "new") label = "新規作成";

      const hideListLink = seg === "stores" || seg === "surveys";
      items.push({ label, href: isLast || hideListLink ? undefined : currentPath });
    });

    return items;
  }, [pathname, lastLabel, lastStoreId, lastDetailLabel]);

  if (crumbs.length <= 1) return null;

  return (
    <nav
      aria-label="パンくずリスト"
      className="pt-4 mb-4 overflow-x-auto text-xs text-slate-600"
    >
      <ol className="flex items-center gap-1 whitespace-nowrap rounded-full border border-pink-100 bg-white/80 px-3 py-2 shadow-sm">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={`${crumb.href ?? crumb.label}-${index}`} className="flex items-center gap-2">
              {crumb.href && !isLast ? (
                <Link to={crumb.href} className="text-pink-600 hover:text-pink-500">
                  <span className="px-1">{crumb.label}</span>
                </Link>
              ) : (
                <span className={isLast ? "font-semibold text-slate-800 px-1" : "px-1"}>
                  {crumb.label}
                </span>
              )}
              {!isLast && <span className="text-slate-300">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
