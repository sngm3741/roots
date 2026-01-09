import { Award, Clock, MapPinned, Shield, ThumbsUp, Users } from "lucide-react";

import { Breadcrumb } from "../components/Breadcrumb";
import { PageHeader } from "../components/PageHeader";
import { PageLayout } from "../components/PageLayout";

export default function StrengthsRoute() {
  const strengths = [
    {
      icon: <MapPinned className="text-emerald-600" size={56} />,
      title: "知多半島特化",
      description:
        "知多半島エリアに特化することで、移動コストを最小化。迅速な対応と低価格を実現しています。",
      details: [
        "移動時間を最小限に抑えたスピーディーな対応",
        "地域密着だからこその柔軟なスケジュール調整",
        "移動コスト削減による低価格の実現",
      ],
    },
    {
      icon: <Award className="text-emerald-600" size={56} />,
      title: "公共事業請負実績あり",
      description:
        "市町村の公共事業を請け負った実績があり、品質と信頼性が証明されています。",
      details: [
        "厳しい基準をクリアした確かな技術力",
        "公的機関からの信頼の証",
        "長年培ったノウハウと経験",
      ],
    },
    {
      icon: <Users className="text-emerald-600" size={56} />,
      title: "熟練作業者のみ対応",
      description:
        "経験豊富な熟練作業者が丁寧に作業を行います。近隣への配慮も徹底しています。",
      details: [
        "10年以上の経験を持つベテランスタッフ",
        "近隣への挨拶・配慮を徹底",
        "安全管理の徹底",
      ],
    },
    {
      icon: <Clock className="text-emerald-600" size={56} />,
      title: "迅速対応",
      description:
        "お問い合わせから最短3営業日で対応可能。緊急の草刈りニーズにも柔軟に対応します。",
      details: [
        "お見積もり当日～翌営業日に提出",
        "緊急対応も可能（別途相談）",
        "作業後の報告も迅速に実施",
      ],
    },
    {
      icon: <Shield className="text-emerald-600" size={56} />,
      title: "万全の保険体制",
      description:
        "万が一の事故に備え、損害賠償保険に加入しています。安心してお任せください。",
      details: ["施設賠償責任保険加入済み", "作業中の事故にも対応", "安全第一の作業体制"],
    },
    {
      icon: <ThumbsUp className="text-emerald-600" size={56} />,
      title: "高い顧客満足度",
      description: "リピート率90%以上。お客様からの高い評価をいただいています。",
      details: ["法人顧客のリピート率90%以上", "丁寧なヒアリングと提案", "アフターフォローも万全"],
    },
  ];

  return (
    <PageLayout>
      <PageHeader
        title="当社の強み"
        subtitle="Strengths"
        description="知多草刈りサービスが選ばれる6つの理由"
      />
      <Breadcrumb
        items={[
          { label: "TOP", path: "/" },
          { label: "当社の強み", path: "/strengths" },
        ]}
      />

      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {strengths.map((strength, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="p-8">
                  <div className="mb-6">{strength.icon}</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{strength.title}</h2>
                  <p className="text-gray-600 leading-relaxed mb-6">{strength.description}</p>
                  <div className="border-t border-gray-200 pt-6">
                    <ul className="space-y-2">
                      {strength.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-emerald-600 mt-1">✓</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
