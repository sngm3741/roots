import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PageHeader } from '../components/PageHeader';
import { Breadcrumb } from '../components/Breadcrumb';
import { BookOpen } from 'lucide-react';

export function ColumnPage() {
  const columns = [
    {
      id: 1,
      title: '草刈り機の種類と選び方：用途別ガイド',
      description: '刈払機、芝刈り機、草刈機など、様々な草刈り機の特徴と、現場に適した機器の選び方を詳しく解説します。',
      icon: '🛠️'
    },
    {
      id: 2,
      title: '雑草の種類と効果的な駆除方法',
      description: 'セイタカアワダチソウ、スギナ、クズなど、厄介な雑草の特徴と、それぞれに適した駆除・管理方法をご紹介。',
      icon: '🌿'
    },
    {
      id: 3,
      title: '防草シートの正しい選び方と施工方法',
      description: '防草シートの種類、耐用年数、施工時の注意点など、長期的な雑草対策に役立つ情報をまとめました。',
      icon: '📋'
    },
    {
      id: 4,
      title: '年間を通じた草刈りスケジュールの立て方',
      description: '春夏秋冬、季節ごとの草刈りのポイントと、効率的な年間管理スケジュールの組み方を解説します。',
      icon: '📅'
    },
    {
      id: 5,
      title: '法人が草刈りを外注するメリットとコスト比較',
      description: '自社管理と外注の比較、コストメリット、業者選びのポイントなど、法人様向けの実践的な情報です。',
      icon: '💼'
    },
    {
      id: 6,
      title: '太陽光発電所の雑草管理：発電効率を守るために',
      description: 'パネル周辺の雑草が発電効率に与える影響と、適切な管理頻度、注意すべきポイントを専門家が解説。',
      icon: '☀️'
    },
    {
      id: 7,
      title: '空き地・遊休地の雑草トラブルと法的責任',
      description: '空き地の雑草放置が引き起こすトラブル事例と、所有者の管理責任、近隣への配慮について説明します。',
      icon: '⚖️'
    },
    {
      id: 8,
      title: '環境に配慮した草刈り方法と刈草の活用',
      description: '除草剤を使わない環境配慮型の草刈り手法と、刈草を堆肥として活用する方法をご紹介します。',
      icon: '♻️'
    },
    {
      id: 9,
      title: '知多半島の気候と雑草：地域特性を知る',
      description: '知多半島特有の気候条件と、それに適した雑草管理のポイント、地域で多く見られる雑草について。',
      icon: '🗾'
    },
    {
      id: 10,
      title: '草刈り作業の安全対策：事故を防ぐために',
      description: '草刈り機の安全な使い方、作業時の服装、熱中症対策など、安全に作業を行うための基礎知識。',
      icon: '⚠️'
    },
    {
      id: 11,
      title: '駐車場の雑草対策：アスファルトの隙間から生える雑草',
      description: 'アスファルトの割れ目から生える雑草の対策、砂利敷きとの比較、長期的な管理方法を解説。',
      icon: '🅿️'
    },
    {
      id: 12,
      title: '草刈りの最適な時間帯と天候の関係',
      description: '作業効率と安全性を考慮した最適な作業時間帯、雨天時の判断基準などをご紹介します。',
      icon: '🌤️'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <PageHeader 
          title="コラム" 
          subtitle="Column"
          description="草刈りや緑地管理に関する豆知識・専門情報"
        />
        <Breadcrumb 
          items={[
            { label: 'TOP', path: '/' },
            { label: 'コラム', path: '/column' }
          ]}
        />

        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6">
                {columns.map((column) => (
                  <div 
                    key={column.id}
                    className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-emerald-300 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{column.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-start gap-2">
                          <BookOpen className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
                          <span>{column.title}</span>
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {column.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}