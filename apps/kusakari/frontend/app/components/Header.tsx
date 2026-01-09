import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Menu, X } from "lucide-react";

import { headerNavItems, mobileNavItems } from "./navigation";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-white/95"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="text-xl sm:text-2xl font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              知多草刈りサービス
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-8">
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
            className="lg:hidden p-2 text-gray-700"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {isMobileMenuOpen ? (
          <div className="lg:hidden py-4 border-t border-gray-200 max-h-[80vh] overflow-y-auto">
            <nav className="flex flex-col gap-4">
              {mobileNavItems.map((item) => (
                <div key={item.path}>
                  <Link
                    to={item.path}
                    onClick={closeMobileMenu}
                    className="block text-left text-gray-700 hover:text-emerald-700 transition-colors font-medium py-2 w-full"
                  >
                    {item.label}
                  </Link>
                  {item.hasSubmenu && item.submenu ? (
                    <div className="ml-4 mt-2 space-y-2">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          onClick={closeMobileMenu}
                          className="block text-left text-gray-600 hover:text-emerald-700 transition-colors text-sm py-1 w-full"
                        >
                          → {subItem.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
