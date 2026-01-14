import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { PostIcon } from "../ui/post-icon";
import { Brain, Heart } from "lucide-react";
import { BlueskyIcon, XIcon } from "../ui/social-icons";

const navItems = [
  { label: "よくある質問", href: "/faq" },
  { label: "お問い合わせ", href: "/contact" },
  { label: "投稿ガイドライン", href: "/guideline" },
  { label: "利用規約", href: "/terms" },
  { label: "運営会社情報", href: "/company" },
];

const collabItems = [
  {
    id: "partner",
    title: "提携店舗募集中",
    label: "掲載のご相談はこちら",
    description: "掲載・提携をご希望の店舗運営者様はお問い合わせください。",
    imageUrl: "/logo.jpeg",
    href: "/contact",
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

function CloseIcon() {
  return (
    <div className="relative h-5 w-5">
      <span className="absolute left-0 top-2 h-0.5 w-5 rotate-45 rounded-full bg-slate-800" />
      <span className="absolute left-0 top-2 h-0.5 w-5 -rotate-45 rounded-full bg-slate-800" />
    </div>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 bg-white/60 backdrop-blur-2xl border border-gray-200/50 rounded-2xl shadow-lg shadow-black/5">
        <div className="px-4">
          <div className="relative flex items-center h-14">
            {/* Menu Button - Left */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 relative z-[60] -ml-2 mr-3"
              aria-label="メニューを開く"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            {/* Actions */}
            <div className="flex flex-1 items-center overflow-x-auto">
              <div className="flex w-max items-center gap-6">
                <a
                  href="/"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300"
                  aria-label="ホーム"
                >
                  <img
                    src="/logo.jpeg"
                    alt="MakotoClub"
                    className="h-full w-full object-cover scale-110"
                  />
                </a>
                <a
                  href="/rag"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm transition hover:bg-emerald-100"
                  aria-label="AI"
                >
                  <Brain className="h-5 w-5" />
                </a>
                <a
                  href="/bookmarks"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-pink-200 bg-pink-50 text-pink-600 shadow-sm transition hover:bg-pink-100"
                  aria-label="気になる店舗"
                >
                  <Heart className="h-5 w-5 fill-current" />
                </a>
                <Button
                  asChild
                  variant="secondary"
                  className="h-10 w-10 shrink-0 p-0 border-pink-200 bg-pink-50 text-pink-600 hover:bg-pink-100"
                >
                  <a
                    href="/new"
                    onClick={() => {
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center"
                  >
                    <span className="flex items-center justify-center">
                      <PostIcon className="h-5 w-5" />
                    </span>
                  </a>
                </Button>
                <a
                  href="https://twitter.com/makoto_club3"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black bg-black text-white shadow-sm transition hover:bg-black/90"
                  aria-label="X"
                >
                  <XIcon className="h-5 w-5" />
                </a>
                <a
                  href="https://bsky.app/profile/makoto-club.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#1185fe] bg-[#1185fe] text-white shadow-sm transition hover:bg-[#0f73db]"
                  aria-label="Bluesky"
                >
                  <BlueskyIcon className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

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
                  コラボ情報 🤝
                </span>
              </div>
            </div>
          </div>

          <hr className="text-slate-200"/>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 bg-pink-200">
            {collabItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={() => {
                  setMobileMenuOpen(false);
                }}
                className="block rounded-2xl border border-pink-100/70 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-pink-200 hover:shadow-md"
              >
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.imageUrl}
                      alt={`${item.title}のビジュアル`}
                      className="h-20 w-20 rounded-xl object-cover"
                    />
                    <div className="min-w-0 space-y-2">
                      <p className="text-xs font-semibold text-pink-500">{item.label}</p>
                      <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                      <p className="text-xs text-slate-600">{item.description}</p>
                    </div>
                  </div>
                </div>
              </a>
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
                  <a
                    href="/new"
                    onClick={() => {
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2"
                  >
                    アンケートを投稿する
                    <PostIcon className="h-4 w-4" />
                  </a>
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
