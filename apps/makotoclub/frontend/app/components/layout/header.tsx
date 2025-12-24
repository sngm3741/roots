import { useEffect, useState } from "react";
import { Button } from "../ui/button";

const navItems = [
  { label: "店舗を探す", href: "/stores" },
  { label: "アンケート一覧", href: "/surveys" },
  { label: "アンケート投稿", href: "/surveys/new" },
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
      <header className="fixed top-4 left-4 right-4 z-50 bg-white/60 backdrop-blur-2xl border border-gray-200/50 rounded-2xl shadow-lg shadow-black/5">
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative flex items-center justify-between h-14">
            {/* Mobile Menu Button - Left */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 relative z-[60] -ml-2"
              aria-label="メニューを開く"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            {/* Logo - Center */}
            <a
              href="/"
              className="absolute left-1/2 -translate-x-1/2 flex items-center hover:opacity-80 transition-opacity"
            >
              <img
                src="/logo.jpeg"
                alt="MakotoClub"
                className="w-10 h-10 md:w-8 md:h-8 rounded-lg object-cover"
              />
            </a>

            {/* Spacer for mobile to keep logo centered */}
            <div className="md:hidden w-10" />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* CTA Button */}
            <Button
              asChild
              className="hidden md:block h-10 md:h-8 px-4 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm md:absolute md:right-4 shadow-sm shadow-pink-200"
              size="sm"
            >
              <a
                href="/surveys/new"
                aria-label="アンケート投稿"
                className="flex items-center gap-1"
              >
                <span className="font-medium">投稿する</span>
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay - Outside header */}
      <div
        className={`md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] transition-opacity duration-300 ease-out ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu Panel - Outside header */}
      <div
        className={`md:hidden fixed z-[60] bg-white shadow-2xl rounded-2xl transition-transform duration-300 ease-out ${
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
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <img
                src="/logo.jpeg"
                alt="MakotoClub"
                className="w-8 h-8 rounded-full object-cover"
              />
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-left px-5 py-4 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-50 hover:translate-x-1"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="p-6 border-t border-gray-100">
            <Button
              asChild
              className="w-full px-5 py-4 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-xl text-center shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <a
                href="/stores"
                onClick={() => {
                  setMobileMenuOpen(false);
                }}
              >
                店舗を探す
              </a>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
