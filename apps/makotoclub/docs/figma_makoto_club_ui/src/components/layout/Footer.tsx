interface FooterProps {
  onNavigate: (route: any) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-purple-500" />
            <span className="text-gray-900">MakotoClub</span>
            <span className="text-gray-500 text-sm ml-2">© 2024 All rights reserved.</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate({ page: 'terms' })}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              利用規約
            </button>
            <button
              onClick={() => onNavigate({ page: 'privacy' })}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              プライバシーポリシー
            </button>
            <button
              onClick={() => onNavigate({ page: 'contact' })}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              お問い合わせ
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
