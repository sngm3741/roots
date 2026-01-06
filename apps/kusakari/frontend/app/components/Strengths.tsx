import { Award, MapPinned, Users } from 'lucide-react';

export function Strengths() {
  const strengths = [
    {
      icon: <MapPinned className="text-white" size={48} />,
      title: '知多半島特化',
      description: '知多半島エリアに特化することで、移動コストを最小化。迅速な対応と低価格を実現しています。',
      color: 'bg-emerald-600'
    },
    {
      icon: <Award className="text-white" size={48} />,
      title: '公共事業請負実績あり',
      description: '市町村の公共事業を請け負った実績があり、品質と信頼性が証明されています。',
      color: 'bg-blue-600'
    },
    {
      icon: <Users className="text-white" size={48} />,
      title: '熟練作業者のみ対応',
      description: '経験豊富な熟練作業者が丁寧に作業を行います。近隣への配慮も徹底しています。',
      color: 'bg-teal-600'
    }
  ];

  return (
    <section id="strengths" className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-gray-900 mb-4">
            <span className="block text-lg text-emerald-600 font-bold mb-2">STRENGTHS</span>
            <span className="text-3xl lg:text-4xl">当社の強み</span>
          </h2>
          <p className="text-lg text-gray-700 mt-4">
            地域密着だからこそ実現できる高品質なサービス
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {strengths.map((strength, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className={`${strength.color} p-8 flex justify-center`}>
                {strength.icon}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  {strength.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {strength.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
