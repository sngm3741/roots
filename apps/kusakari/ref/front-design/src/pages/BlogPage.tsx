import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PageHeader } from '../components/PageHeader';
import { Breadcrumb } from '../components/Breadcrumb';
import { Calendar, User } from 'lucide-react';

export function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: '春の草刈りシーズン到来！適切な時期と対策について',
      date: '2024年3月15日',
      author: '作業チーム',
      excerpt: '春になると雑草の成長が活発になります。効果的な草刈りのタイミングと方法についてご紹介します。',
      image: 'https://images.unsplash.com/photo-1766010203610-86665f86acb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFzcyUyMGN1dHRpbmclMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzY3Njg0MjM4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: '季節の作業'
    },
    {
      id: 2,
      title: '太陽光発電所の草刈り管理のポイント',
      date: '2024年3月10日',
      author: '管理担当',
      excerpt: '太陽光パネル周辺の草刈りは発電効率に直結します。専門的な管理方法を解説します。',
      image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xhciUyMHBhbmVsJTIwZmllbGR8ZW58MXx8fHwxNzY3Njg0MjQwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: '施設管理'
    },
    {
      id: 3,
      title: '知多半島の気候に適した草刈り時期',
      date: '2024年3月5日',
      author: '作業チーム',
      excerpt: '知多半島特有の気候を考慮した、最適な草刈りスケジュールをご提案します。',
      image: 'https://images.unsplash.com/photo-1738193830098-2d92352a1856?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXduJTIwbW93aW5nJTIwc2VydmljZXxlbnwxfHx8fDE3Njc2MjE0OTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      category: '地域情報'
    },
    {
      id: 4,
      title: '駐車場の雑草対策：防草シートの活用',
      date: '2024年2月28日',
      author: '技術担当',
      excerpt: '駐車場の雑草対策として効果的な防草シートの選び方と施工方法について。',
      image: 'https://images.unsplash.com/photo-1752945490118-5b1518f98d77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwbGFuZCUyMG1haW50ZW5hbmNlfGVufDF8fHx8MTc2NzY4NDI0MHww&ixlib=rb-4.1.0&q=80&w=1080',
      category: '雑草対策'
    },
    {
      id: 5,
      title: '法人様向け定期管理サービスのご案内',
      date: '2024年2月20日',
      author: '営業担当',
      excerpt: '複数物件を管理されている法人様向けの、お得な年間契約プランについてご紹介します。',
      image: 'https://images.unsplash.com/photo-1758524051476-cf120cb3f1e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBnYXJkZW5pbmclMjB3b3JrfGVufDF8fHx8MTc2NzY4NDIzOXww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'サービス紹介'
    },
    {
      id: 6,
      title: '空き地管理の重要性と近隣トラブル防止',
      date: '2024年2月15日',
      author: '作業チーム',
      excerpt: '放置された空き地が引き起こすトラブルと、適切な管理方法について解説します。',
      image: 'https://images.unsplash.com/photo-1766990194564-d597b23d1de3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvdmVyZ3Jvd24lMjBncmFzcyUyMGJlZm9yZXxlbnwxfHx8fDE3Njc2ODQyMzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      category: '物件管理'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <PageHeader 
          title="ブログ" 
          subtitle="Blog"
          description="草刈りに関する情報や作業の様子をお届けします"
        />
        <Breadcrumb 
          items={[
            { label: 'TOP', path: '/' },
            { label: 'ブログ', path: '/blog' }
          ]}
        />

        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <article 
                  key={post.id}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User size={16} />
                        <span>{post.author}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}