import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, CheckCircle } from "lucide-react";

export function Hero() {
  const [isTextVisible, setIsTextVisible] = useState(false);
  const serviceBadges = [
    
    "土地の草刈り",
    "庭木の剪定",
    "木の伐採",
    "道路の舗装工事",
  ];

  useEffect(() => {
    if (isTextVisible) return;
    const reveal = () => setIsTextVisible(true);
    const handleScroll = () => {
      if (window.scrollY > 0) {
        reveal();
      }
    };
    const timerId = window.setTimeout(reveal, 1000);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("touchstart", reveal, { passive: true });
    window.addEventListener("click", reveal);

    return () => {
      window.clearTimeout(timerId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchstart", reveal);
      window.removeEventListener("click", reveal);
    };
  }, [isTextVisible]);

  return (
    <section className="relative min-h-[70vh] overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      <video
        className="absolute inset-0 h-full w-full object-cover md:hidden"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/hero_poster.jpg"
      >
        <source src="/hero_smaho_540.mp4" type="video/mp4" />
      </video>
      <video
        className="absolute inset-0 h-full w-full object-cover hidden md:block"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/hero_poster.jpg"
      >
        <source src="/hero_720.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        <div
          className={[
            "mx-auto max-w-5xl space-y-6 text-center text-white rounded-2xl bg-black/25 backdrop-blur-sm px-6 py-8 sm:px-10 sm:py-12",
            "transition-all duration-700 ease-out",
            isTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          ].join(" ")}
        >
          <div className="mx-auto inline-flex items-center justify-center bg-emerald-100/90 text-emerald-900 px-4 py-2 rounded-full text-sm font-bold">
            知多半島エリア特化
          </div>

          <h1
            className="leading-tight text-white"
            style={{ textShadow: "0 3px 0 rgba(0,0,0,0.35), 0 10px 18px rgba(0,0,0,0.55)" }}
          >
            <span className="block text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-wide">
              草刈り・剪定・道路の舗装工事サービス
            </span>
            <span className="block text-2xl sm:text-3xl lg:text-4xl mt-4 text-emerald-100 font-extrabold">
              施工実績 1200件以上
            </span>
          </h1>

          <p
            className="text-sm sm:text-lg text-emerald-50/90"
            style={{ textShadow: "0 2px 0 rgba(0,0,0,0.3), 0 6px 12px rgba(0,0,0,0.45)" }}
          >
            最短当日見積・現地調査無料。
            <span className="block mt-1">地域密着・自社施工で大幅なコストカットを実現。</span>
            <span className="block mt-1">
              他社様のお見積もりがある場合も、お気軽にご相談ください。
            </span>
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Link
              to="/contact"
              className="bg-orange-500 text-white px-8 py-4 rounded-full hover:bg-orange-400 transition-colors font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
            >
              無料見積・お問い合わせ
              <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
            {serviceBadges.map((label, index) => (
              <div
                key={`service-badge-${index}`}
                className="grid h-full grid-cols-[18px_1fr] items-start gap-2 rounded-full border border-emerald-200/40 bg-emerald-900/40 px-4 py-2 text-left text-emerald-50"
              >
                <CheckCircle className="text-emerald-200 mt-0.5" size={18} />
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
