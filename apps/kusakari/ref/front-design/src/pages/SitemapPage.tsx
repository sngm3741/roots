import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PageHeader } from '../components/PageHeader';
import { Breadcrumb } from '../components/Breadcrumb';

export function SitemapPage() {
  const sitemapStructure = [
    {
      title: 'TOP',
      path: '/',
      children: []
    },
    {
      title: 'サービス内容',
      path: '/services',
      children: []
    },
    {
      title: '当社の強み',
      path: '/strengths',
      children: []
    },
    {
      title: '料金プラン',
      path: '/pricing',
      children: []
    },
    {
      title: 'よくある質問',
      path: '/faq',
      children: []
    },
    {
      title: '施工事例',
      path: '/works',
      children: [
        { title: '法人向け', path: '/works/corporate' },
        { title: '駐車場管理', path: '/works/parking' },
        { title: '太陽光発電所', path: '/works/solar' },
        { title: '空き地管理', path: '/works/vacant' },
        { title: '定期管理', path: '/works/regular' },
      ]
    },
    {
      title: '対応エリア',
      path: '/area',
      children: []
    },
    {
      title: 'お客様の声',
      path: '/reviews',
      children: []
    },
    {
      title: 'ブログ',
      path: '/blog',
      children: []
    },
    {
      title: 'コラム',
      path: '/column',
      children: []
    },
    {
      title: 'メディア掲載',
      path: '/media',
      children: []
    },
    {
      title: '採用情報',
      path: '/recruit',
      children: []
    },
    {
      title: 'お問い合わせ',
      path: '/contact',
      children: []
    },
    {
      title: '会社概要',
      path: '/company',
      children: []
    },
    {
      title: 'プライバシーポリシー',
      path: '/privacy',
      children: []
    },
    {
      title: 'サイトマップ',
      path: '/sitemap',
      children: []
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <PageHeader 
          title="サイトマップ" 
          subtitle="Sitemap"
        />
        <Breadcrumb 
          items={[
            { label: 'TOP', path: '/' },
            { label: 'サイトマップ', path: '/sitemap' }
          ]}
        />
        
        <section className="py-16 lg:py-4 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-8 lg:p-12">
                <ul className="space-y-6">
                  {sitemapStructure.map((item, index) => (
                    <li key={index}>
                      <a 
                        href={item.path}
                        onClick={(e) => {
                          e.preventDefault();
                          (window as any).navigateTo(item.path);
                        }}
                        className="text-lg font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                      >
                        {item.title}
                      </a>
                      {item.children.length > 0 && (
                        <ul className="mt-3 ml-8 space-y-2">
                          {item.children.map((child, childIndex) => (
                            <li key={childIndex}>
                              <a
                                href={child.path}
                                onClick={(e) => {
                                  e.preventDefault();
                                  (window as any).navigateTo(child.path);
                                }}
                                className="text-gray-700 hover:text-emerald-700 transition-colors flex items-center gap-2"
                              >
                                <span className="text-emerald-600">→</span>
                                {child.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
