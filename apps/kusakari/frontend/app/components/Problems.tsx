import { AlertCircle, Clock, MapPin, ThumbsDown } from "lucide-react";

export function Problems() {
  const problems = [
    {
      icon: <Clock className="text-emerald-600" size={32} />,
      title: "管理物件が多く手が回らない",
      description: "複数の施設・用地の草刈りや剪定が追いつかない",
    },
    {
      icon: <AlertCircle className="text-emerald-600" size={32} />,
      title: "業者選定と品質管理が大変",
      description: "年度ごとに業者が変わり、品質や報告が安定しない",
    },
    {
      icon: <MapPin className="text-emerald-600" size={32} />,
      title: "遠方の土地管理ができない",
      description: "現地確認が難しく、報告の精度も不安",
    },
    {
      icon: <ThumbsDown className="text-emerald-600" size={32} />,
      title: "近隣配慮・安全管理が不安",
      description: "作業品質や安全対応のばらつきが気になる",
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-gray-900 mb-4">
            <span className="block text-lg text-emerald-600 font-bold mb-2">PROBLEMS</span>
            <span className="text-3xl lg:text-4xl">こんなお悩みありませんか？</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-gray-50 p-6 rounded-lg border-2 border-gray-100 hover:border-emerald-200 transition-all hover:shadow-md"
            >
              <div className="mb-4">{problem.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {problem.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{problem.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xl text-gray-700 font-bold">
            そのお悩み、知多草刈りサービスが解決します！
          </p>
        </div>
      </div>
    </section>
  );
}
