import { useEffect, useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface WorksProps {
  showHeading?: boolean;
}

export function Works({ showHeading = true }: WorksProps) {
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);
  const works = [
    {
      beforeImage: "/ba/01_before.jpg",
      afterImage: "/ba/01_after.jpg",
      area: "知多市",
      type: "草刈り",
      size: "約20㎡",
    },
    {
      beforeImage: "/ba/02_before.jpg",
      afterImage: "/ba/02_after.jpg",
      area: "東海市",
      type: "草刈り",
      size: "約2,000㎡",
    },
    {
      beforeImage: "/ba/03_before.jpg",
      afterImage: "/ba/03_after.jpg",
      area: "半田市",
      type: "道路舗装",
      size: "約2㎡",
    },
    {
      beforeImage: "/ba/04_before.jpg",
      afterImage: "/ba/04_after.jpg",
      area: "大府市",
      type: "草刈り",
      size: "約150㎡",
    },
    {
      beforeImage: "/ba/05_before.jpg",
      afterImage: "/ba/05_after.jpg",
      area: "大府市",
      type: "草刈り",
      size: "約200㎡",
    },
    {
      beforeImage: "/ba/06_before.jpg",
      afterImage: "/ba/06_after.jpg",
      area: "豊明市",
      type: "草刈り",
      size: "約50㎡",
    },
  ];

  useEffect(() => {
    if (!modalImage) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setModalImage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalImage]);

  return (
    <section id="works" className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        {showHeading ? (
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-gray-900 mb-4">
              <span className="block text-lg text-emerald-600 font-bold mb-2">WORKS</span>
              <span className="text-3xl lg:text-4xl">施工実績</span>
            </h2>
            <p className="text-lg text-gray-700 mt-4">
              庭木の剪定から公共事業まで、確実な品質で対応します
            </p>
          </div>
        ) : null}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {works.map((work, index) => (
            <div
              key={index}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="grid grid-cols-2 gap-2 p-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1 font-bold">BEFORE</div>
                  <div className="aspect-square rounded overflow-hidden">
                    <button
                      type="button"
                      className="h-full w-full"
                      onClick={() => setModalImage({ src: work.beforeImage, alt: "施工前" })}
                      aria-label="施工前の写真を拡大表示"
                    >
                      <ImageWithFallback
                        src={work.beforeImage}
                        alt="施工前"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-emerald-600 mb-1 font-bold">AFTER</div>
                  <div className="aspect-square rounded overflow-hidden">
                    <button
                      type="button"
                      className="h-full w-full"
                      onClick={() => setModalImage({ src: work.afterImage, alt: "施工後" })}
                      aria-label="施工後の写真を拡大表示"
                    >
                      <ImageWithFallback
                        src={work.afterImage}
                        alt="施工後"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-gray-700">エリア:</span>
                    <span>{work.area}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-gray-700">面積:</span>
                    <span>{work.size}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="inline-block bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-bold">
                    {work.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="absolute -top-10 right-0 text-white text-sm"
              onClick={() => setModalImage(null)}
            >
              閉じる
            </button>
            <img
              src={modalImage.src}
              alt={modalImage.alt}
              className="max-h-[90vh] w-full rounded-lg object-contain"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
