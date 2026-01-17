import { Award, MapPinned, Users } from "lucide-react";

export function Strengths() {
  const strengths = [
    {
      icon: <MapPinned className="text-white" size={48} />,
      title: "地域密着・広域も相談可",
      description: "知多半島を中心に迅速対応。条件により名古屋・県外の出張もご相談いただけます。",
      color: "bg-emerald-600",
    },
    {
      icon: <Award className="text-white" size={48} />,
      title: "公共事業請負実績",
      description: "市町村の公共事業で培った品質基準と安全管理で対応します。",
      color: "bg-blue-600",
    },
    {
      icon: <Users className="text-white" size={48} />,
      title: "自社施工・柔軟対応",
      description: "熟練技術者による自社施工。土日・夜間の緊急対応もご相談可能です。",
      color: "bg-teal-600",
    },
  ];

  return (
    <section
      id="strengths"
      className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-emerald-50"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-gray-900 mb-4">
            <span className="block text-lg text-emerald-600 font-bold mb-2">STRENGTHS</span>
            <span className="text-3xl lg:text-4xl">当社の強み</span>
          </h2>
          <p className="text-lg text-gray-700 mt-4">
            自社施工×地域密着でコストを抑え、価格保証（他社見積提示で調整）にも対応
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {strengths.map((strength, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className={`${strength.color} p-8 flex justify-center`}>{strength.icon}</div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  {strength.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{strength.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
