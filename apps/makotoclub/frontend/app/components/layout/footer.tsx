import { Link } from "react-router";

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
            <Link className="hover:text-gray-900 transition-colors" to="/guideline">
              投稿ガイドライン
            </Link>
            <Link className="hover:text-gray-900 transition-colors" to="/terms">
              利用規約
            </Link>
            <Link className="hover:text-gray-900 transition-colors" to="/privacy">
              プライバシーポリシー
            </Link>
            <Link className="hover:text-gray-900 transition-colors" to="/contact">
              お問い合わせ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
