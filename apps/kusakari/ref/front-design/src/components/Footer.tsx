export function Footer() {
  const handleNavigation = (path: string) => {
    (window as any).navigateTo(path);
  };

  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: 'TOP', path: '/' },
    { label: 'サービス内容', path: '/services' },
    { label: '当社の強み', path: '/strengths' },
    { label: '料金プラン', path: '/pricing' },
    { label: 'よくある質問', path: '/faq' },
    { label: '施工事例', path: '/works' },
    { label: '対応エリア', path: '/area' },
    { label: 'お客様の声', path: '/reviews' },
    { label: 'ブログ', path: '/blog' },
    { label: 'コラム', path: '/column' },
    { label: 'メディア掲載', path: '/media' },
    { label: '採用情報', path: '/recruit' },
    { label: 'お問い合わせ', path: '/contact' },
    { label: '会社概要', path: '/company' },
    { label: 'プライバシーポリシー', path: '/privacy' },
    { label: 'サイトマップ', path: '/sitemap' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-8">
          {/* 会社情報 */}
          <div>
            <h3 className="text-xl font-bold mb-4">知多草刈りサービス</h3>
            <p className="text-gray-400 leading-relaxed mb-4">
              知多半島エリア特化の草刈り・除草管理サービス。法人・施設管理者向けに迅速で確実な対応をお約束します。
            </p>
          </div>

          {/* 対応エリア */}
          <div>
            <h3 className="text-lg font-bold mb-4">対応エリア</h3>
            <div className="text-gray-400 text-sm space-y-1">
              <p>半田市、常滑市、東海市、大府市</p>
              <p>知多市、東浦町、阿久比町</p>
              <p>武豊町、美浜町、南知多町</p>
            </div>
          </div>

          {/* サイトマップ */}
          <div>
            <h3 className="text-lg font-bold mb-4">サイトマップ</h3>
            <nav className="grid grid-cols-2 gap-x-4 gap-y-2">
              {footerLinks.slice(0, 10).map((link) => (
                <button
                  key={link.path}
                  onClick={() => handleNavigation(link.path)}
                  className="text-left text-gray-400 hover:text-emerald-400 transition-colors text-sm"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>&copy; {currentYear} 知多草刈りサービス All rights reserved.</p>
            <div className="flex gap-6">
              <button 
                onClick={() => handleNavigation('/privacy')}
                className="hover:text-emerald-400 transition-colors"
              >
                プライバシーポリシー
              </button>
              <button 
                onClick={() => handleNavigation('/sitemap')}
                className="hover:text-emerald-400 transition-colors"
              >
                サイトマップ
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}