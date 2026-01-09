import { Link } from "react-router";
import { Leaf, Calendar, TreeDeciduous } from "lucide-react";

export function Services() {
  const services = [
    {
      icon: <Leaf className="text-emerald-600" size={40} />,
      title: "草刈り・除草",
      description: "雑草の刈り取り、除草作業を丁寧に実施します。作業後の刈草処分も対応可能です。",
      price: "300円〜 / ㎡",
      features: ["手作業・機械作業対応", "刈草処分込み", "単発・スポット対応"],
    },
    {
      icon: <Calendar className="text-emerald-600" size={40} />,
      title: "定期管理",
      description: "年間契約で定期的な草刈りを実施。管理物件の美観維持をサポートします。",
      price: "お見積もり",
      features: ["年間契約割引あり", "定期訪問スケジュール調整", "報告書提出対応"],
    },
    {
      icon: <TreeDeciduous className="text-emerald-600" size={40} />,
      title: "伐採・防草対応",
      description: "樹木の伐採や防草シート施工など、総合的な緑地管理にも対応します。",
      price: "別途お見積もり",
      features: ["小規模伐採対応", "防草シート施工", "砂利敷き対応"],
    },
  ];

  return (
    <section id="services" className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-gray-900 mb-4">
            <span className="block text-lg text-emerald-600 font-bold mb-2">
              SERVICES & PRICING
            </span>
            <span className="text-3xl lg:text-4xl">サービス・料金</span>
          </h2>
          <p className="text-lg text-gray-700 mt-4">
            お客様のニーズに合わせた柔軟なサービスを提供
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-emerald-300 hover:shadow-lg transition-all"
            >
              <div className="mb-6">{service.icon}</div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {service.title}
              </h3>

              <p className="text-gray-600 mb-6 leading-relaxed">
                {service.description}
              </p>

              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="text-sm text-gray-500 mb-1">料金目安</div>
                <div className="text-2xl font-bold text-emerald-600">
                  {service.price}
                </div>
                <div className="text-sm text-gray-500 mt-1">※条件により変動</div>
              </div>

              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-emerald-600 mt-1">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-emerald-50 p-8 rounded-lg">
          <p className="text-gray-700 mb-4">
            <span className="font-bold text-lg">まずはお気軽にご相談ください</span>
            <br />
            写真があれば概算見積も可能です
          </p>
          <Link
            to="/contact"
            className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-bold"
          >
            お問い合わせはこちら
          </Link>
        </div>
      </div>
    </section>
  );
}
