export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm ml-2">© マコトクラブ</span>
            <img
              src="/logo.jpeg"
              alt="MakotoClub"
              className="w-6 h-6 rounded-full object-cover"
            />
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <a className="hover:text-gray-900 transition-colors" href="/guideline">
              投稿ガイドライン
            </a>
            <a className="hover:text-gray-900 transition-colors" href="/terms">
              利用規約
            </a>
            <a className="hover:text-gray-900 transition-colors" href="/privacy">
              プライバシーポリシー
            </a>
            <a className="hover:text-gray-900 transition-colors" href="/contact">
              お問い合わせ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
