import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (path: string) => {
    (window as any).navigateTo(path);
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { label: 'サービス内容', path: '/services' },
    { label: '料金プラン', path: '/pricing' },
    { label: '施工事例', path: '/works' },
    { label: '対応エリア', path: '/area' },
    { label: '当社の強み', path: '/strengths' },
    { label: 'よくある質問', path: '/faq' },
  ];

  const mobileNavItems = [
    { label: 'TOP', path: '/' },
    { label: 'サービス内容', path: '/services' },
    { label: '当社の強み', path: '/strengths' },
    { label: '料金プラン', path: '/pricing' },
    { label: 'よくある質問', path: '/faq' },
    { label: '施工事例', path: '/works', hasSubmenu: true, submenu: [
      { label: '法人向け', path: '/works/corporate' },
      { label: '駐車場管理', path: '/works/parking' },
      { label: '太陽光発電所', path: '/works/solar' },
      { label: '空き地管理', path: '/works/vacant' },
      { label: '定期管理', path: '/works/regular' },
    ]},
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
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/95'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* ロゴ */}
          <div className="flex items-center">
            <button 
              onClick={() => handleNavigation('/')}
              className="text-xl sm:text-2xl font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              知多草刈りサービス
            </button>
          </div>

          {/* デスクトップナビゲーション */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className="text-gray-700 hover:text-emerald-700 transition-colors font-medium"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* CTAボタン */}
          <div className="hidden lg:block">
            <button
              onClick={() => handleNavigation('/contact')}
              className="bg-emerald-600 text-white px-6 py-3 rounded-md hover:bg-emerald-700 transition-colors font-bold"
            >
              無料見積・お問い合わせ
            </button>
          </div>

          {/* モバイルメニューボタン */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 max-h-[80vh] overflow-y-auto">
            <nav className="flex flex-col gap-4">
              {mobileNavItems.map((item) => (
                <div key={item.path}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className="text-left text-gray-700 hover:text-emerald-700 transition-colors font-medium py-2 w-full"
                  >
                    {item.label}
                  </button>
                  {item.hasSubmenu && item.submenu && (
                    <div className="ml-4 mt-2 space-y-2">
                      {item.submenu.map((subItem) => (
                        <button
                          key={subItem.path}
                          onClick={() => handleNavigation(subItem.path)}
                          className="block text-left text-gray-600 hover:text-emerald-700 transition-colors text-sm py-1 w-full"
                        >
                          → {subItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}