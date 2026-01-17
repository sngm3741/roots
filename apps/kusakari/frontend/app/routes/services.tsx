import { Link } from "react-router";
import { CheckCircle, Calendar, Leaf, TreeDeciduous } from "lucide-react";

import { Breadcrumb } from "../components/Breadcrumb";
import { PageHeader } from "../components/PageHeader";
import { PageLayout } from "../components/PageLayout";

export default function ServicesRoute() {
  const services = [
    {
      icon: <Leaf className="text-emerald-600" size={48} />,
      title: "草刈り・除草",
      description:
        "法人・行政の管理地や公共施設の草刈りを中心に、報告まで一貫して対応します。",
      features: [
        "定期・スポット対応",
        "刈草の回収・処分込み",
        "報告書提出対応",
        "近隣配慮・安全管理",
      ],
    },
    {
      icon: <TreeDeciduous className="text-emerald-600" size={48} />,
      title: "剪定・伐採",
      description:
        "高木や危険木の剪定・伐採にも対応。安全と近隣配慮を徹底します。",
      features: [
        "高木・危険木も対応",
        "剪定・伐採後の処分込み",
        "現地調査無料",
        "行政案件の基準にも対応",
      ],
    },
    {
      icon: <Calendar className="text-emerald-600" size={48} />,
      title: "道路の舗装工事",
      description: "小規模な舗装補修や通路整備など、草刈りと合わせた対応が可能です。",
      features: [
        "小規模補修に対応",
        "草刈りと同時施工OK",
        "現地調査無料",
        "条件により対応可否を判断",
      ],
    },
  ];

  return (
    <PageLayout>
      <PageHeader
        title="サービス内容"
        subtitle="Services"
        backgroundImage="/page-headers/services.png"
      />
      <Breadcrumb
        items={[
          { label: "TOP", path: "/" },
          { label: "サービス内容", path: "/services" },
        ]}
      />

      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-emerald-300 hover:shadow-lg transition-all"
              >
                <div className="mb-6">{service.icon}</div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h2>

                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-bold text-gray-900 mb-4">サービス詳細</h3>
                  <ul className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle className="text-emerald-600 flex-shrink-0 mt-1" size={18} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center bg-emerald-50 p-10 rounded-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">まずはお気軽にご相談ください</h3>
            <p className="text-gray-700 mb-6">
              価格保証（他社見積提示で調整）・現場条件に合わせて最適にご提案します
            </p>
            <Link
              to="/contact"
              className="bg-emerald-600 text-white px-8 py-4 rounded-lg hover:bg-emerald-700 transition-colors font-bold text-lg"
            >
              お問い合わせはこちら
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
