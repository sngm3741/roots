import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PageHeader } from '../components/PageHeader';
import { Breadcrumb } from '../components/Breadcrumb';
import { Leaf, Calendar, TreeDeciduous, CheckCircle } from 'lucide-react';

export function ServicesPage() {
  const services = [
    {
      icon: <Leaf className="text-emerald-600" size={48} />,
      title: '草刈り・除草',
      description: '雑草の刈り取り、除草作業を丁寧に実施します。作業後の刈草処分も対応可能です。',
      features: [
        '手作業・機械作業の両方に対応',
        '刈草の回収・処分込み',
        '単発・スポット対応可能',
        '緊急対応も承ります'
      ]
    },
    {
      icon: <Calendar className="text-emerald-600" size={48} />,
      title: '定期管理サービス',
      description: '年間契約で定期的な草刈りを実施。管理物件の美観維持をサポートします。',
      features: [
        '年間契約で割引価格',
        '定期訪問スケジュール調整',
        '作業報告書提出対応',
        '年間計画の立案サポート'
      ]
    },
    {
      icon: <TreeDeciduous className="text-emerald-600" size={48} />,
      title: '伐採・防草対応',
      description: '樹木の伐採や防草シート施工など、総合的な緑地管理にも対応します。',
      features: [
        '小規模伐採対応',
        '防草シート施工',
        '砂利敷き対応',
        '雑草対策のご提案'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <PageHeader 
          title="サービス内容" 
          subtitle="Services"
          description="知多半島エリアに特化した草刈り・除草サービスを提供しています"
        />
        <Breadcrumb 
          items={[
            { label: 'TOP', path: '/' },
            { label: 'サービス内容', path: '/services' }
          ]}
        />

        <section className="py-16 lg:py-4 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
              {services.map((service, index) => (
                <div 
                  key={index}
                  className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-emerald-300 hover:shadow-lg transition-all"
                >
                  <div className="mb-6">
                    {service.icon}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {service.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>

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
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                まずはお気軽にご相談ください
              </h3>
              <p className="text-gray-700 mb-6">
                現場の状況に応じて最適なプランをご提案いたします
              </p>
              <button
                onClick={() => (window as any).navigateTo('/contact')}
                className="bg-emerald-600 text-white px-8 py-4 rounded-lg hover:bg-emerald-700 transition-colors font-bold text-lg"
              >
                お問い合わせはこちら
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
