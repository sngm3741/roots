import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Button } from "../ui/button";
import { PostIcon } from "../ui/post-icon";
import { ChevronUp } from "lucide-react";

const sitemapSections = [
  {
    title: "探す",
    items: [
      { label: "店舗一覧", href: "/stores" },
      { label: "アンケート一覧", href: "/surveys" },
      { label: "ブックマーク", href: "/bookmarks" },
    ],
  },
  {
    title: "アンケート",
    items: [
      { label: "アンケート投稿", href: "/new" },
      { label: "投稿ガイドライン", href: "/guideline" },
      { label: "よくある質問", href: "/faq" },
    ],
  },
  {
    title: "読み物",
    items: [{ label: "体験談ストーリーズ", href: "/stories" }],
  },
  {
    title: "サービス",
    items: [
      { label: "マコトGPT", href: "/rag" },
      { label: "お問い合わせ", href: "/contact" },
    ],
  },
  {
    title: "運営情報",
    items: [
      { label: "運営会社情報", href: "/company" },
      { label: "特定商取引法", href: "/tokushoho" },
      { label: "利用規約", href: "/terms" },
      { label: "プライバシー", href: "/privacy" },
    ],
  },
];

function MenuIcon() {
  return (
    <div className="space-y-1">
      <span className="block h-0.5 w-5 rounded-full bg-slate-800" />
      <span className="block h-0.5 w-5 rounded-full bg-slate-800" />
      <span className="block h-0.5 w-5 rounded-full bg-slate-800" />
    </div>
  );
}

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFloatingButtonVisible, setIsFloatingButtonVisible] = useState(true);
  const [currentScrollY, setCurrentScrollY] = useState(0);
  const [isTallPage, setIsTallPage] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const updateScrollableState = () => {
      const scrollableHeight = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        0,
      );
      // ある程度の縦長ページだけ「最上部へ」ボタンを対象にする
      setIsTallPage(scrollableHeight > 900);
    };

    updateScrollableState();
    window.addEventListener("resize", updateScrollableState);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && document.body) {
      resizeObserver = new ResizeObserver(updateScrollableState);
      resizeObserver.observe(document.body);
    }

    return () => {
      window.removeEventListener("resize", updateScrollableState);
      resizeObserver?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      setIsFloatingButtonVisible(false);
      return;
    }

    setIsFloatingButtonVisible(true);
    let lastScrollY = window.scrollY;
    setCurrentScrollY(lastScrollY);
    let stopTimer: number | null = null;
    const threshold = 6;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = Math.abs(currentScrollY - lastScrollY);
      setCurrentScrollY(currentScrollY);

      if (delta > threshold) {
        setIsFloatingButtonVisible(false);
      }

      lastScrollY = currentScrollY;

      if (stopTimer !== null) {
        window.clearTimeout(stopTimer);
      }
      stopTimer = window.setTimeout(() => {
        setIsFloatingButtonVisible(true);
      }, 120);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (stopTimer !== null) {
        window.clearTimeout(stopTimer);
      }
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) return;
    // ルート遷移後に非表示状態を引きずらない
    setIsFloatingButtonVisible(true);
    setCurrentScrollY(window.scrollY);
  }, [location.key, mobileMenuOpen]);

  const shouldShowBackToTop = !mobileMenuOpen && isTallPage && currentScrollY > 280;

  return (
    <>
      {!mobileMenuOpen ? (
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className={`fixed left-4 top-4 z-[70] inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200/70 bg-white/90 text-gray-700 shadow-lg shadow-black/10 backdrop-blur-xl transition-all duration-150 hover:border-gray-300 hover:text-gray-900 ${
            isFloatingButtonVisible
              ? "translate-y-0 opacity-100"
              : "-translate-y-4 opacity-0 pointer-events-none"
          }`}
          aria-label="メニューを開く"
        >
          <MenuIcon />
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-5 right-4 z-[70] inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200/60 bg-white/70 text-slate-500 shadow-md shadow-black/10 backdrop-blur-xl transition-all duration-150 hover:border-gray-300 hover:bg-white/85 hover:text-slate-700 ${
          shouldShowBackToTop && isFloatingButtonVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-3 opacity-0 pointer-events-none"
        }`}
        aria-label="ページ先頭へ移動"
      >
        <ChevronUp className="h-5 w-5" />
      </button>

      {/* Menu Overlay - Outside header */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] transition-opacity duration-300 ease-out ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Menu Panel - Outside header */}
      <div
        className={`fixed z-[60] bg-white shadow-2xl rounded-[32px] overflow-hidden transition-transform duration-300 ease-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-[calc(100%+24px)]"
        }`}
        style={{
          top: "24px",
          left: "24px",
          bottom: "24px",
          width: "calc(100vw - 100px)",
          maxWidth: "360px",
        }}
      >
        <div className="h-full flex flex-col">
          {/* Menu Header */}
          <div className="px-4 py-2 bg-pink-100">
            <div className="rounded-2xl border border-gray-200/50 bg-white/80 p-3 shadow-lg shadow-black/5 backdrop-blur-2xl">
              <div className="relative flex">
                <img
                  src="/logo.jpeg"
                  alt="MakotoClub"
                  className="ml-2 w-8 h-8 rounded-lg object-cover"
                />
                <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap italic text-xl font-semibold text-gray-700">
                  サイトマップ 🧭
                </span>
              </div>
            </div>
          </div>

          <hr className="text-slate-200"/>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 bg-pink-200">
            {sitemapSections.map((section) => (
              <div key={section.title} className="rounded-2xl border border-pink-100/70 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold tracking-wide text-pink-500">{section.title}</p>
                <div className="mt-3 grid gap-2">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => {
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <span>{item.label}</span>
                      <span className="text-xs text-slate-400">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* メニューフッター */}
          <hr className="text-slate-200 "/>
          <div className="menu-footer mt-auto bg-pink-100">
            <div className="px-4 py-2">
              <div className="rounded-[28px] border border-gray-200/50 bg-white/60 p-4 shadow-lg shadow-black/5 backdrop-blur-2xl">
              <div className="relative">
                <div className="relative mb-3 text-pink-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 40.2 90.4"
                  aria-hidden="true"
                  className="absolute -left-1 -top-0.5 w-7 text-slate-600 opacity-60"
                  style={{ transform: "rotate(22deg)" }}
                  fill="currentColor"
                >
                  <path d="M7.3,39.2c1.6-1.2,3.1-2.4,4.7-3.4,4-2.6,8.3-3,12.8-1.7,5,1.4,7.1,7.2,4.2,11.6-4.3,6.6-11.4,6.2-16.4,2.9-1.9-1.2-3.5-2.7-5.4-4.2-1.3,1.6-2.5,3.4-3.2,5.5-2.8,9.4.2,17.4,6.2,24.5,1.1,1.4,2.8,2.4,4.4,3.3,3.9,2,8,3.9,12.5,3.8,2.7,0,5.3-.4,8.3-.6-1.3-1.4-2.3-2.5-3.4-3.6-.2-.2-.3-.4-.5-.6-.4-.6-.7-1.3,0-1.9.7-.6,1.3-.3,1.9.3.4.5.8,1,1.3,1.4,1.3,1.1,2.7,2.3,4.1,3.2,1.3.9,1.6,1.7.7,3-1.4,1.8-2.9,3.6-4.4,5.4-.5.6-1,1.1-1.5,1.7-.6.7-1.3,1.1-2.1.5-.7-.5-.7-1.3,0-2.2.7-.9,1.5-1.7,2.2-2.6.4-.5.8-.9,1.1-1.7-.9.1-1.7.3-2.6.3-1.9.1-3.9.4-5.8.3-5.8-.1-10.8-2.5-15.6-5.5-1.7-1.1-3.2-2.6-4.4-4.2C2.7,69.3-.1,63.5,0,56.6c0-5.2,1.3-9.9,4.7-14,.6-.7.6-1.2.1-1.9-3.3-5.1-3.9-10.8-3.5-16.6.4-5.3,1.9-10.3,4.9-14.8C9.1,4.9,13.4,2.5,18.3,1c1.4-.4,2.8-.6,4.3-.8.7,0,1.5-.2,2.2-.2.7,0,1.3,0,1.9.2s1.2.3,1.6.8.2.5.2.7c0,.5-.8.8-1.2.8-1.9.2-3.9.1-5.8.4-3.9.5-7.2,2.3-10.2,4.7-3.5,2.9-5.2,7-6.3,11.3-1.2,4.6-1.2,9.3-.3,14,.4,2.2,1.4,4.2,2.6,6.1ZM12.4,44.7c1.9,1.6,4.2,2.8,6.7,3s5.5-1.1,7.1-3.5c2.2-3.1.9-6.7-2.8-7.6-5.6-1.4-10,.7-13.9,4.6-.1.1-.1.7,0,.9.4.4.8.8,1.2,1.2.5.5,1,.9,1.5,1.3Z" />
                </svg>
                <div className="pl-10 text-lg font-semibold">
                  <p className="text-base text-slate-600">
                    <span className="opacity-60">PayPayプレゼント</span>
                    <span className="opacity-100"> 🎁</span>
                  </p>
                </div>
              </div>
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-xl text-center shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Link
                    to="/new"
                    onClick={() => {
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2"
                  >
                    アンケートを投稿する
                    <PostIcon className="h-4 w-4" />
                  </Link>
                </Button>
            </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </>
  );
}
