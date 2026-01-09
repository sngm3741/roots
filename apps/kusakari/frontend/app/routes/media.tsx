import { Newspaper, Radio, Tv } from "lucide-react";
import { Link } from "react-router";

import { Breadcrumb } from "../components/Breadcrumb";
import { PageHeader } from "../components/PageHeader";
import { PageLayout } from "../components/PageLayout";

export default function MediaRoute() {
  const mediaList = [
    {
      type: "TV",
      icon: <Tv className="text-emerald-600" size={32} />,
      title: "CBCテレビ「チャント！」",
      date: "2024年2月15日",
      description: "知多半島の草刈り事業者として、地域密着型のサービスが紹介されました。",
      tag: "テレビ",
    },
    {
      type: "Newspaper",
      icon: <Newspaper className="text-emerald-600" size={32} />,
      title: "中日新聞 知多版",
      date: "2024年1月20日",
      description: "公共事業の請負実績と、地域貢献活動について取り上げていただきました。",
      tag: "新聞",
    },
    {
      type: "Web",
      icon: <Newspaper className="text-emerald-600" size={32} />,
      title: "愛知経済Web",
      date: "2023年12月10日",
      description: "法人向け草刈りサービスの需要増加について、当社の取り組みが紹介されました。",
      tag: "Webメディア",
    },
    {
      type: "Radio",
      icon: <Radio className="text-emerald-600" size={32} />,
      title: "FM AICHI「モーニングチャージ」",
      date: "2023年11月5日",
      description: "太陽光発電所の草刈り管理について、専門家としてインタビューを受けました。",
      tag: "ラジオ",
    },
    {
      type: "Newspaper",
      icon: <Newspaper className="text-emerald-600" size={32} />,
      title: "半田よいとこ新聞",
      date: "2023年10月12日",
      description: "地元半田市での草刈りサービスの特集記事に掲載されました。",
      tag: "地域紙",
    },
    {
      type: "Web",
      icon: <Newspaper className="text-emerald-600" size={32} />,
      title: "知多半島ナビ",
      date: "2023年9月1日",
      description: "知多半島エリアの便利なサービスとして紹介していただきました。",
      tag: "Webメディア",
    },
  ];

  return (
    <PageLayout>
      <PageHeader title="メディア掲載" subtitle="Media" description="テレビ・新聞・Webメディアでの掲載情報" />
      <Breadcrumb
        items={[
          { label: "TOP", path: "/" },
          { label: "メディア掲載", path: "/media" },
        ]}
      />

      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {mediaList.map((media, index) => (
                <div
                  key={index}
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 lg:p-8 hover:border-emerald-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">{media.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                          {media.tag}
                        </span>
                        <span className="text-sm text-gray-500">{media.date}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{media.title}</h3>
                      <p className="text-gray-700 leading-relaxed">{media.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center bg-white border-2 border-emerald-200 p-8 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-3">取材のご依頼について</h3>
              <p className="text-gray-700 mb-6">メディア取材・掲載に関するお問い合わせは、お気軽にご連絡ください</p>
              <Link
                to="/contact"
                className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-bold"
              >
                お問い合わせ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
