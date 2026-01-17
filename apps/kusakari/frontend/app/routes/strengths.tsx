import { Award, Clock, MapPinned, Shield, ThumbsUp, Users } from "lucide-react";

import { Breadcrumb } from "../components/Breadcrumb";
import { PageHeader } from "../components/PageHeader";
import { PageLayout } from "../components/PageLayout";

export default function StrengthsRoute() {
  const strengths = [
    {
      icon: <MapPinned className="text-emerald-600" size={56} />,
      title: "地域密着・広域も相談可",
      description:
        "知多半島を中心に、条件により名古屋・県外の出張もご相談いただけます。",
      details: [
        "知多半島中心のスピーディー対応",
        "名古屋・県外は条件により対応可",
        "移動コスト削減で価格に還元",
      ],
    },
    {
      icon: <Award className="text-emerald-600" size={56} />,
      title: "公共事業請負実績",
      description:
        "市町村の公共事業実績があり、品質と安全基準を満たした対応が可能です。",
      details: [
        "行政基準の安全管理",
        "報告書・写真提出に対応",
        "現場ごとの運用ルールに順守",
      ],
    },
    {
      icon: <Users className="text-emerald-600" size={56} />,
      title: "自社施工・熟練技術者",
      description:
        "外注に頼らず自社施工。熟練技術者が責任を持って対応します。",
      details: [
        "品質がぶれにくい体制",
        "現場対応の意思決定が早い",
        "安全・近隣配慮を徹底",
      ],
    },
    {
      icon: <Clock className="text-emerald-600" size={56} />,
      title: "柔軟対応・緊急相談",
      description:
        "土日・夜間の緊急対応もご相談可能。現場状況に合わせて柔軟に調整します。",
      details: [
        "緊急対応の相談可",
        "工程・日程の柔軟調整",
        "現場連絡のスピード重視",
      ],
    },
    {
      icon: <Shield className="text-emerald-600" size={56} />,
      title: "価格保証に対応",
      description:
        "地域密着と自社施工でコストを削減。価格保証（他社見積提示で調整）に対応します。",
      details: [
        "他社見積の提示で調整",
        "現場条件を踏まえた適正価格",
        "明確な内訳をご説明",
      ],
    },
    {
      icon: <ThumbsUp className="text-emerald-600" size={56} />,
      title: "報告と近隣配慮",
      description: "写真付き報告や近隣配慮など、管理者目線の運用に対応します。",
      details: ["写真付き報告書に対応", "近隣配慮・安全誘導", "管理者との連携を重視"],
    },
  ];

  return (
    <PageLayout>
      <PageHeader
        title="当社の強み"
        subtitle="Strengths"
        backgroundImage="/page-headers/strengths.png"
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
