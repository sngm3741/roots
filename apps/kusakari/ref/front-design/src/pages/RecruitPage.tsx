import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PageHeader } from '../components/PageHeader';
import { Breadcrumb } from '../components/Breadcrumb';
import { Users, Heart, TrendingUp, Coffee } from 'lucide-react';

export function RecruitPage() {
  const positions = [
    {
      title: '草刈り作業スタッフ（正社員）',
      type: '正社員',
      description: '草刈り作業全般を担当していただきます。未経験者歓迎、丁寧に指導いたします。',
      requirements: [
        '普通自動車免許（AT限定可）',
        '体力に自信のある方',
        '屋外作業が好きな方',
        '未経験者歓迎'
      ],
      conditions: {
        salary: '月給25万円〜35万円（経験・能力による）',
        benefits: '社会保険完備、交通費支給、資格取得支援',
        hours: '8:00〜17:00（実働8時間）',
        holidays: '週休2日制（日曜・他1日）、GW、夏季休暇、年末年始'
      }
    },
    {
      title: '草刈り作業スタッフ（アルバイト・パート）',
      type: 'アルバイト',
      description: '週2日〜勤務可能。時間や日数はご相談に応じます。',
      requirements: [
        '普通自動車免許（AT限定可）',
        '週2日以上勤務できる方',
        '未経験者歓迎',
        '60歳以上の方も歓迎'
      ],
      conditions: {
        salary: '時給1,200円〜1,500円（経験による）',
        benefits: '交通費支給、労災保険',
        hours: '8:00〜17:00の間で相談可',
        holidays: 'シフト制'
      }
    }
  ];

  const benefits = [
    {
      icon: <Users className="text-emerald-600" size={40} />,
      title: '充実した研修制度',
      description: '未経験でも安心。先輩スタッフが丁寧に指導します。'
    },
    {
      icon: <Heart className="text-emerald-600" size={40} />,
      title: 'アットホームな職場',
      description: '少人数のチームで、風通しの良い環境です。'
    },
    {
      icon: <TrendingUp className="text-emerald-600" size={40} />,
      title: '成長できる環境',
      description: '資格取得支援あり。スキルアップを応援します。'
    },
    {
      icon: <Coffee className="text-emerald-600" size={40} />,
      title: 'ワークライフバランス',
      description: '週休2日制で、プライベートも充実できます。'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <PageHeader 
          title="採用情報" 
          subtitle="Recruit"
          description="一緒に働く仲間を募集しています"
        />
        <Breadcrumb 
          items={[
            { label: 'TOP', path: '/' },
            { label: '採用情報', path: '/recruit' }
          ]}
        />

        {/* メッセージ */}
        <section className="py-16 bg-gradient-to-br from-emerald-50 to-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                地域に貢献できる仕事
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                知多草刈りサービスでは、知多半島の美しい環境を守るため、一緒に働く仲間を募集しています。<br />
                草刈りという仕事を通じて、地域の皆様に喜ばれ、感謝される。<br />
                そんなやりがいのある仕事を一緒にしませんか？
              </p>
            </div>
          </div>
        </section>

        {/* 募集職種 */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              募集職種
            </h2>
            <div className="max-w-5xl mx-auto space-y-8">
              {positions.map((position, index) => (
                <div 
                  key={index}
                  className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">{position.title}</h3>
                    <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold">
                      {position.type}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-6">{position.description}</p>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">応募資格</h4>
                      <ul className="space-y-2">
                        {position.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <span className="text-emerald-600 mt-1">✓</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">待遇・条件</h4>
                      <div className="space-y-3 text-gray-700">
                        <div>
                          <span className="font-bold">給与：</span>
                          <span className="ml-2">{position.conditions.salary}</span>
                        </div>
                        <div>
                          <span className="font-bold">福利厚生：</span>
                          <span className="ml-2">{position.conditions.benefits}</span>
                        </div>
                        <div>
                          <span className="font-bold">勤務時間：</span>
                          <span className="ml-2">{position.conditions.hours}</span>
                        </div>
                        <div>
                          <span className="font-bold">休日：</span>
                          <span className="ml-2">{position.conditions.holidays}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 働く魅力 */}
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              働く魅力
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 応募フロー */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              応募から入社まで
            </h2>
            <div className="max-w-3xl mx-auto">
              <div className="space-y-6">
                {[
                  { step: 1, title: 'お問い合わせ', description: 'メールまたはお電話でご連絡ください' },
                  { step: 2, title: '面接', description: '履歴書をお持ちいただき、面接を行います' },
                  { step: 3, title: '職場見学', description: '実際の作業現場を見学いただけます' },
                  { step: 4, title: '合否連絡', description: '面接後、1週間以内にご連絡いたします' },
                  { step: 5, title: '入社', description: '入社日を相談の上、決定します' }
                ].map((flow, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-6 bg-gray-50 p-6 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                      {flow.step}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{flow.title}</h3>
                      <p className="text-gray-600 text-sm">{flow.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 応募フォーム */}
        <section className="py-16 bg-gradient-to-br from-emerald-50 to-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center bg-white border-2 border-emerald-200 p-10 rounded-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                ご応募・お問い合わせ
              </h3>
              <p className="text-gray-700 mb-6">
                少しでも興味をお持ちいただけましたら、お気軽にお問い合わせください。<br />
                職場見学も随時受け付けております。
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => (window as any).navigateTo('/contact')}
                  className="bg-emerald-600 text-white px-8 py-4 rounded-lg hover:bg-emerald-700 transition-colors font-bold text-lg w-full sm:w-auto"
                >
                  応募・お問い合わせはこちら
                </button>
                <div className="text-gray-600 text-sm">
                  または お電話でも受け付けております<br />
                  <span className="font-bold text-lg text-gray-900">TEL: 052-XXX-XXXX</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
