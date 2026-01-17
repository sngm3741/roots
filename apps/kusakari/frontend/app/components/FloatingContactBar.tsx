import { useEffect, useRef, useState } from "react";
import { Mail, Phone, ArrowUp, Clock } from "lucide-react";
import { InstagramIcon } from "./InstagramIcon";
import { LineIcon } from "./LineIcon";

const CONTACT_PHONE = "09063349093";
const CONTACT_EMAIL = "testyou@gmail.com";
const INSTAGRAM_URL = "https://www.instagram.com/toransu0409";
const LINE_URL = "https://lin.ee/kkV7C2T";

export function FloatingContactBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(false);
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
      hideTimerRef.current = window.setTimeout(() => {
        setIsVisible(true);
      }, 240);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleMenuToggle = (event: Event) => {
      const customEvent = event as CustomEvent<{ isOpen: boolean }>;
      setIsMenuOpen(Boolean(customEvent.detail?.isOpen));
    };

    window.addEventListener("mobile-menu-toggle", handleMenuToggle);
    return () => window.removeEventListener("mobile-menu-toggle", handleMenuToggle);
  }, []);

  const handleScrollTop = () => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={[
        "fixed inset-x-0 bottom-0 z-50",
        "transition-all duration-300 ease-out",
        isVisible && !isMenuOpen
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-3 pointer-events-none",
      ].join(" ")}
      aria-hidden={!isVisible || isMenuOpen}
    >
      <div className="w-full px-0 sm:px-0 pb-0">
        {/* PC */}
        <div className="hidden md:flex items-stretch overflow-hidden border border-gray-300 bg-gray-200/80 backdrop-blur-md">
          <a
            href={`tel:${CONTACT_PHONE}`}
            className="flex-1 px-6 py-5 text-center text-gray-900 hover:bg-gray-300 transition-colors"
            aria-label="電話で問い合わせる"
          >
            <Phone className="mx-auto" />
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="flex-1 px-6 py-5 text-center text-gray-900 hover:bg-gray-300 transition-colors"
            aria-label="メールで問い合わせる"
          >
            <Mail className="mx-auto" />
          </a>
          <a
            href={LINE_URL}
            target="_blank"
            rel="noreferrer"
            className="flex-1 px-6 py-5 text-center text-gray-900 hover:bg-gray-300 transition-colors"
            aria-label="LINEで問い合わせる"
          >
            <LineIcon className="mx-auto h-6 w-6" />
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="flex-1 px-6 py-5 text-center text-gray-900 hover:bg-gray-300 transition-colors"
            aria-label="Instagramを見る"
          >
            <InstagramIcon className="mx-auto h-6 w-6" />
          </a>
          <button
            type="button"
            onClick={handleScrollTop}
            className="w-14 bg-black text-white hover:bg-gray-800 transition-colors"
            aria-label="ページ上部へ戻る"
          >
            <ArrowUp className="mx-auto" />
          </button>
        </div>

        {/* SP */}
        <div className="md:hidden">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border border-gray-200 bg-white/80 px-4 py-3 backdrop-blur-md">
            <div className="flex flex-col items-center justify-center text-center text-gray-700">
              <span className="text-sm font-semibold">お気軽にご相談ください</span>
              <span className="flex items-center gap-1 text-[11px] text-gray-500">
                <Clock className="h-3 w-3" aria-hidden="true" />
                9:00~18:00
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${CONTACT_PHONE}`}
                className="grid h-14 w-20 place-items-center gap-1 bg-emerald-600 px-2 py-2 text-[11px] font-semibold text-white"
                aria-label="電話"
              >
                <Phone size={22} />
                <span>電話</span>
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="grid h-14 w-20 place-items-center gap-1 bg-emerald-600 px-2 py-2 text-[11px] font-semibold text-white"
                aria-label="メール"
              >
                <Mail size={22} />
                <span>メール</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
