import { Link } from "react-router";
import { ArrowRight, CheckCircle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-emerald-50 to-white pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-bold">
              知多半島エリア特化
            </div>

            <h1 className="text-gray-900 leading-tight">
              <span className="block text-3xl sm:text-4xl lg:text-5xl">知多半島の草刈り・除草管理</span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl mt-3 text-emerald-700">法人・施設管理者向け</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
              管理物件・太陽光・駐車場・空き地の維持管理を<br />
              地域密着・迅速対応でサポートします
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/contact"
                className="bg-emerald-600 text-white px-8 py-4 rounded-lg hover:bg-emerald-700 transition-colors font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
              >
                無料見積・お問い合わせ
                <ArrowRight size={20} />
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                <span className="font-medium">公共事業実績あり</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                <span className="font-medium">熟練作業者のみ対応</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1738193830098-2d92352a1856?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXduJTIwbW93aW5nJTIwc2VydmljZXxlbnwxfHx8fDE3Njc2MjE0OTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="草刈り作業風景"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -z-10 top-8 right-8 w-full h-full bg-emerald-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
