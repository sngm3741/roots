import { Link } from "react-router";
import { Check } from "lucide-react";

import { Breadcrumb } from "../components/Breadcrumb";
import { PageHeader } from "../components/PageHeader";
import { PageLayout } from "../components/PageLayout";

export default function PricingRoute() {
  const pricingPlans = [
    {
      name: "草刈り・剪定・伐採",
      price: "お見積もり",
      unit: "",
      description: "法人・行政の現場に合わせた標準プランです",
      features: ["定期・スポット対応", "報告書提出対応", "刈草・剪定枝の処分込み", "現地調査無料"],
      highlight: false,
    },
    {
      name: "定期管理プラン",
      price: "お見積もり",
      unit: "",
      description: "複数拠点・広域管理に最適な年間契約プランです",
      features: ["年3回〜のご訪問", "スケジュール調整", "報告書提出対応", "優先対応", "複数拠点の一括管理"],
      highlight: true,
    },
    {
      name: "道路の舗装工事",
      price: "別途お見積もり",
      unit: "",
      description: "草刈りと合わせた小規模補修・通路整備に対応します",
      features: ["小規模補修に対応", "草刈りと同時施工OK", "現地調査無料", "条件により対応可否を判断"],
      highlight: false,
    },
  ];

  const additionalInfo = [
    {
      title: "追加料金が発生する場合",
      items: ["傾斜地・急斜面の場合", "大型機械が入れない場所", "障害物が多い現場", "安全対策が必要な高木・危険木"],
    },
    {
      title: "割引対象",
      items: ["年間契約での定期管理", "複数物件の一括依頼", "広範囲（500㎡以上）の作業", "リピートでのご依頼"],
    },
  ];

  return (
    <PageLayout>
      <PageHeader
        title="料金プラン"
        subtitle="Pricing"
        backgroundImage="/page-headers/pricing.png"
      />
      <Breadcrumb
        items={[
          { label: "TOP", path: "/" },
          { label: "料金プラン", path: "/pricing" },
        ]}
      />

      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl overflow-hidden ${
                  plan.highlight ? "border-4 border-emerald-500 shadow-xl transform scale-105" : "border-2 border-gray-200 shadow-md"
                }`}
              >
                {plan.highlight ? (
                  <div className="bg-emerald-600 text-white text-center py-2 font-bold">おすすめ</div>
                ) : null}
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h2>
                  <p className="text-gray-600 mb-6 text-sm">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-emerald-600">{plan.price}</span>
                    {plan.unit ? <span className="text-gray-600 ml-1">{plan.unit}</span> : null}
                    <p className="text-sm text-gray-500 mt-1">※条件により変動</p>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="text-emerald-600 flex-shrink-0 mt-1" size={18} />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {additionalInfo.map((info, index) => (
              <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{info.title}</h3>
                <ul className="space-y-2">
                  {info.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-emerald-600">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="my-16 text-center bg-emerald-50 p-10 rounded-xl max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">正確なお見積もりは無料です</h3>
            <p className="text-gray-700 mb-6">
              価格保証（他社見積提示で調整）・写真があれば概算見積も可能です
            </p>
            <Link
              to="/contact"
              className="bg-emerald-600 text-white px-8 py-4 rounded-lg hover:bg-emerald-700 transition-colors font-bold text-lg"
            >
              無料見積もりを依頼する
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
