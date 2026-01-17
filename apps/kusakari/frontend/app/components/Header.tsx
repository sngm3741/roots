import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Menu, X, Plus, Minus } from "lucide-react";

import { headerNavItems, mobileNavItems } from "./navigation";
import { InstagramIcon } from "./InstagramIcon";
import { LineIcon } from "./LineIcon";
import { XIcon } from "./XIcon";

const MENU_SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/toransu0409", icon: InstagramIcon },
  { label: "LINE", href: "https://lin.ee/kkV7C2T", icon: LineIcon },
  { label: "X", href: "https://x.com/example", icon: XIcon },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenuPath, setOpenSubmenuPath] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const toggleSubmenu = (path: string) => {
    setOpenSubmenuPath((current) => (current === path ? null : path));
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("mobile-menu-toggle", { detail: { isOpen: isMobileMenuOpen } })
    );
  }, [isMobileMenuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-white/95"
      }`}
    >
      <div
        className={`transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="relative grid h-20 grid-cols-[1fr_auto] items-center">
          <div className="flex items-center">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="text-xl sm:text-2xl font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              知多草刈りサービス
            </Link>
          </div>

          <div className="flex items-center justify-end gap-3">
            <div className="hidden lg:block">
              <Link
                to="/contact"
                className="bg-emerald-600 text-white px-6 py-3 rounded-md hover:bg-emerald-700 transition-colors font-bold"
              >
                無料見積・お問い合わせ
              </Link>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700"
              aria-label="メニューを開く"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 lg:flex items-center gap-8">
            {headerNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-gray-700 hover:text-emerald-700 transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          </div>
        </div>
      </div>

        <div
          className={[
            "fixed inset-0 z-40 bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900 text-white transition-opacity duration-300",
            isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          ].join(" ")}
          aria-hidden={!isMobileMenuOpen}
        >
          <div
            className={[
              "h-full overflow-y-auto transition-transform duration-300",
              isMobileMenuOpen ? "translate-y-0" : "-translate-y-2",
            ].join(" ")}
          >
            <div className="container mx-auto px-4 sm:px-6">
              <div className="grid h-20 grid-cols-[1fr_auto] items-center">
                <Link
                  to="/"
                  onClick={closeMobileMenu}
                  className="text-xl sm:text-2xl font-bold text-emerald-100 hover:text-white transition-colors"
                >
                  知多草刈りサービス
                </Link>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 text-emerald-100 hover:text-white transition-colors"
                  aria-label="メニューを閉じる"
                >
                  <X size={28} />
                </button>
              </div>
            </div>
          <nav className="mx-auto max-w-3xl divide-y divide-emerald-700/60 px-4 pb-10 pt-4 sm:px-6">
            {mobileNavItems.map((item) => {
                const isOpen = openSubmenuPath === item.path;
                return (
                  <div key={item.path} className="py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to={item.path}
                        onClick={closeMobileMenu}
                        className="flex-1 text-left text-base font-semibold tracking-wide text-emerald-50 hover:text-emerald-100 transition-colors"
                      >
                        {item.label}
                      </Link>
                      {item.hasSubmenu && item.submenu ? (
                        <button
                          type="button"
                          onClick={() => toggleSubmenu(item.path)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-600/70 text-emerald-100 hover:bg-emerald-700/60 transition-colors"
                          aria-label={`${item.label}の詳細を${isOpen ? "閉じる" : "開く"}`}
                        >
                          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                        </button>
                      ) : null}
                      <span className="ml-4 text-emerald-200">›</span>
                    </div>
                    {item.hasSubmenu && item.submenu ? (
                      <div
                        className={[
                          "grid gap-2 overflow-hidden pl-4 pr-2 transition-all duration-300 ease-out",
                          isOpen ? "mt-3 max-h-80 opacity-100" : "max-h-0 opacity-0",
                        ].join(" ")}
                      >
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            onClick={closeMobileMenu}
                            className="text-sm text-emerald-100 hover:text-emerald-50 transition-colors"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
          </nav>
          <div className="pb-10">
            <div className="mx-auto flex max-w-3xl items-center justify-center gap-6 px-4 sm:px-6">
              {MENU_SOCIAL_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-600/70 text-emerald-100 hover:bg-emerald-700/60 transition-colors"
                    aria-label={link.label}
                  >
                    <Icon size={36} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
        </div>
    </header>
  );
}
