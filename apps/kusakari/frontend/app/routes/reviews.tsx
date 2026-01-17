import { Quote, Star } from "lucide-react";

import { Breadcrumb } from "../components/Breadcrumb";
import { ContactCtaCard } from "../components/ContactCtaCard";
import { PageHeader } from "../components/PageHeader";
import { PageLayout } from "../components/PageLayout";

export default function ReviewsRoute() {
  const reviews = [
    {
      id: 1,
      type: "法人",
      category: "不動産管理",
      rating: 5,
      comment:
        "複数の管理物件の草刈りを定期的にお願いしています。対応が早く、作業も丁寧で、報告書も毎回きちんと提出していただけるので助かっています。法人向けの年間契約プランも割引があり、コストメリットも感じています。",
      date: "2024年12月",
      services: ["定期管理", "複数物件", "報告書提出"],
    },
    {
      id: 2,
      type: "法人",
      category: "太陽光発電",
      rating: 5,
      comment:
        "パネル周辺の草刈りを年間契約でお願いしています。雑草が伸びる前に定期的に訪問していただけるので、発電効率への影響もなく安心です。作業も丁寧で、パネルへの配慮も十分にしていただいています。",
      date: "2024年11月",
      services: ["太陽光", "年間契約", "発電効率維持"],
    },
    {
      id: 3,
      type: "個人",
      category: "空き地管理",
      rating: 5,
      comment:
        "遠方に所有している空き地の草刈りをお願いしました。見積もりから作業まで迅速で、写真付きの報告書もいただけたので、現地に行かなくても安心できました。仕上がりも綺麗で満足しています。",
      date: "2024年10月",
      services: ["空き地", "遠隔管理", "写真報告"],
    },
    {
      id: 4,
      type: "法人",
      category: "駐車場管理",
      rating: 5,
      comment:
        "社員用駐車場の草刈りを年2回お願いしています。駐車場利用に支障が出ないよう、早朝に作業していただくなど、柔軟に対応してくださいます。料金も良心的で、継続してお願いしたいと思っています。",
      date: "2024年9月",
      services: ["駐車場", "時間調整", "定期管理"],
    },
    {
      id: 5,
      type: "法人",
      category: "施設管理",
      rating: 4,
      comment:
        "管理しているビルの敷地内の草刈りをお願いしました。急な依頼にも快く対応していただき、3日後には作業完了。入居者様からも「綺麗になった」と好評でした。",
      date: "2024年8月",
      services: ["緊急対応", "ビル管理", "迅速対応"],
    },
    {
      id: 6,
      type: "個人",
      category: "一般住宅",
      rating: 5,
      comment:
        "実家の庭の草刈りをお願いしました。高齢の両親だけでは管理が難しくなり、こちらにお願いすることに。作業が丁寧で、両親への対応も親切で安心できました。また次回もお願いしたいです。",
      date: "2024年7月",
      services: ["庭の草刈り", "高齢者対応", "丁寧な作業"],
    },
    {
      id: 7,
      type: "法人",
      category: "不動産開発",
      rating: 5,
      comment:
        "開発予定地の草刈りを定期的にお願いしています。近隣への配慮も徹底されており、クレームもなく助かっています。作業スケジュールも柔軟に調整していただけるのがありがたいです。",
      date: "2024年6月",
      services: ["開発予定地", "近隣配慮", "スケジュール調整"],
    },
    {
      id: 8,
      type: "法人",
      category: "工場管理",
      rating: 5,
      comment:
        "工場敷地内の草刈りを年3回お願いしています。面積が広いため、以前は複数の業者に分けて依頼していましたが、こちらに一本化できてコストも削減できました。作業も効率的で助かっています。",
      date: "2024年5月",
      services: ["工場敷地", "広範囲対応", "コスト削減"],
    },
    {
      id: 9,
      type: "個人",
      category: "駐車場",
      rating: 4,
      comment:
        "月極駐車場を経営しており、年2回草刈りをお願いしています。利用者様からの評判も良く、契約率向上にも繋がっていると感じます。価格も適正で満足しています。",
      date: "2024年4月",
      services: ["月極駐車場", "美観維持", "定期管理"],
    },
  ];

  const stats = [
    { label: "お客様満足度", value: "98%" },
    { label: "リピート率", value: "92%" },
    { label: "平均評価", value: "4.9" },
  ];

  return (
    <PageLayout>
      <PageHeader
        title="お客様の声"
        subtitle="Reviews"
        backgroundImage="/page-headers/reviews.png"
      />
      <Breadcrumb
        items={[
          { label: "TOP", path: "/" },
          { label: "お客様の声", path: "/reviews" },
        ]}
      />

      <section className="py-12 bg-emerald-600">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <div className="text-4xl lg:text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-2 lg:py-4 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 lg:p-8 hover:border-emerald-300 transition-colors"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-2">
                      {review.type === "法人" ? "法人のお客様" : "個人のお客様"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                        {review.type}
                      </span>
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                        {review.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{review.date}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 sm:mt-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="text-yellow-400 fill-yellow-400" size={20} />
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <Quote className="absolute -left-2 -top-2 text-emerald-200" size={32} />
                  <p className="text-gray-700 leading-relaxed pl-8 mb-4">{review.comment}</p>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  {review.services.map((service, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                      #{service}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="my-16">
            <ContactCtaCard
              title="あなたも安心のサービスを体験してみませんか？"
              description="多くのお客様にご満足いただいているサービスをぜひお試しください"
              ctaLabel="無料見積もりを依頼する"
              ctaLink="/contact"
            />
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
