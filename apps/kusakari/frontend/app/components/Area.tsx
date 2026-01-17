import { MapPin, CheckCircle, XCircle } from "lucide-react";

interface AreaProps {
  showHeading?: boolean;
}

export function Area({ showHeading = true }: AreaProps) {
  const areas = [
    { name: "半田市", available: true },
    { name: "常滑市", available: true },
    { name: "東海市", available: true },
    { name: "大府市", available: true },
    { name: "知多市", available: true },
    { name: "東浦町", available: true },
    { name: "阿久比町", available: true },
    { name: "武豊町", available: true },
    { name: "美浜町", available: true },
    { name: "南知多町", available: true },
  ];

  return (
    <section id="area" className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        {showHeading ? (
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-gray-900 mb-4">
              <span className="block text-lg text-emerald-600 font-bold mb-2">SERVICE AREA</span>
              <span className="text-3xl lg:text-4xl">対応エリア</span>
            </h2>
            <p className="text-lg text-gray-700 mt-4">知多半島全域をメインに地域密着で対応</p>
          </div>
        ) : null}

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-8 lg:p-12 shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <MapPin className="text-emerald-600" size={32} />
              <h3 className="text-2xl font-bold text-gray-900">対応可能エリア一覧</h3>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {areas.map((area, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm"
                >
                  <CheckCircle className="text-emerald-600 flex-shrink-0" size={24} />
                  <span className="font-bold text-gray-900">{area.name}</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg p-6 border-2 border-blue-200">
              <div className="flex items-start gap-3">
                <XCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">エリア外のご相談</h4>
                  <p className="text-gray-700 leading-relaxed">
                    基本は知多半島エリア中心ですが、名古屋・県外の出張も条件により対応可能です。<br />
                    規模や日程に応じて調整しますので、まずはご相談ください。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              地域密着と自社施工で移動コストを削減し、<br className="hidden sm:block" />
              迅速対応と価格保証（他社見積提示で調整）を実現しています。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
