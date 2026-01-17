import { Link } from "react-router";
import { Leaf, Calendar, TreeDeciduous } from "lucide-react";

export function Services() {
  const services = [
    {
      icon: <Leaf className="text-emerald-600" size={40} />,
      title: "草刈り・除草",
      description: "法人・行政の管理地や公共施設の草刈りを中心に対応。報告まで一貫して行います。",
      price: "お見積もり",
      features: ["定期・スポット対応", "刈草の回収・処分込み", "報告書提出対応"],
    },
    {
      icon: <TreeDeciduous className="text-emerald-600" size={40} />,
      title: "剪定・伐採",
      description: "高木や危険木の剪定・伐採にも対応。近隣配慮と安全管理を徹底します。",
      price: "お見積もり",
      features: ["高木・危険木も対応", "剪定・伐採後の処分込み", "現地調査無料"],
    },
    {
      icon: <Calendar className="text-emerald-600" size={40} />,
      title: "道路の舗装工事",
      description: "小規模な舗装補修や通路整備など、草刈りと合わせた対応が可能です。",
      price: "別途お見積もり",
      features: ["小規模補修に対応", "草刈りと同時施工OK", "現地調査無料"],
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
            個人・法人・行政を問わず草刈り・剪定・伐採を主軸に、道路の舗装工事なども柔軟に対応
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
            価格保証（他社見積提示で調整）・写真があれば概算見積も可能です
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
