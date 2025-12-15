import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeaderProps {
  currentPage: string;
  onNavigate: (route: any) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { label: '店舗を探す', page: 'stores' },
    { label: 'アンケート一覧', page: 'surveys' },
    { label: 'アンケート投稿', page: 'survey-new' }
  ];

  return (
    <>
      <header className="fixed top-4 left-4 right-4 z-50 bg-white/60 backdrop-blur-2xl border border-gray-200/50 rounded-2xl shadow-lg shadow-black/5">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:justify-center">
            {/* Mobile Menu Button - Left */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 relative z-[60] -ml-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo - Center on mobile, Left on desktop */}
            <button 
              onClick={() => onNavigate({ page: 'top' })}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity md:absolute md:left-4"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-purple-500" />
              <span className="text-lg text-gray-900">MakotoClub</span>
            </button>

            {/* Spacer for mobile to keep logo centered */}
            <div className="md:hidden w-10" />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => onNavigate({ page: item.page })}
                  className={`text-sm transition-colors ${
                    currentPage === item.page
                      ? 'text-pink-500'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* CTA Button */}
            <button
              onClick={() => onNavigate({ page: 'stores' })}
              className="hidden md:block px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm md:absolute md:right-4"
            >
              店舗を探す
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay - Outside header */}
      <div 
        className={`md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] transition-opacity duration-300 ease-out ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu Panel - Outside header */}
      <div 
        className={`md:hidden fixed z-[60] bg-white shadow-2xl rounded-2xl transition-transform duration-300 ease-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-[calc(100%+24px)]'
        }`}
        style={{
          top: '24px',
          left: '24px',
          bottom: '24px',
          width: 'calc(100vw - 100px)',
          maxWidth: '360px',
        }}
      >
        <div className="h-full flex flex-col">
          {/* Menu Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500" />
              <span className="text-lg text-gray-900">MakotoClub</span>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => {
                  onNavigate({ page: item.page });
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-5 py-4 rounded-xl transition-all duration-200 ${
                  currentPage === item.page
                    ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50 hover:translate-x-1'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          
          {/* CTA Button */}
          <div className="p-6 border-t border-gray-100">
            <button
              onClick={() => {
                onNavigate({ page: 'stores' });
                setMobileMenuOpen(false);
              }}
              className="w-full px-5 py-4 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-xl text-center shadow-lg hover:shadow-xl transition-all duration-200"
            >
              店舗を探す
            </button>
          </div>
        </div>
      </div>
    </>
  );
}