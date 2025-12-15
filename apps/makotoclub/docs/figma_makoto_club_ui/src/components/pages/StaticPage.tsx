import { Breadcrumbs } from '../ui/Breadcrumbs';

interface StaticPageProps {
  title: string;
  onNavigate: (route: any) => void;
}

export function StaticPage({ title, onNavigate }: StaticPageProps) {
  return (
    <div className="py-16">
      <div className="max-w-3xl mx-auto px-4">
        <Breadcrumbs
          items={[
            { label: 'ホーム', onClick: () => onNavigate({ page: 'top' }) },
            { label: title }
          ]}
        />

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <h1 className="text-gray-900 mb-8">{title}</h1>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-gray-900 mb-4">サンプルセクション</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              これは{title}ページのサンプルコンテンツです。実際の運用では、ここに具体的な内容を記載してください。
            </p>

            <h2 className="text-gray-900 mb-4">第1条（定義）</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              本規約において使用する用語の定義は、以下のとおりとします。
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>「本サービス」とは、当社が提供するMakotoClubという名称のサービスを指します。</li>
              <li>「ユーザー」とは、本サービスを利用する全ての方を指します。</li>
              <li>「投稿情報」とは、ユーザーが本サービスを通じて投稿した情報を指します。</li>
            </ul>

            <h2 className="text-gray-900 mb-4">第2条（適用）</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              本規約は、本サービスの利用に関する一切の関係に適用されます。ユーザーは、本サービスを利用することにより、本規約の内容に同意したものとみなされます。
            </p>

            <h2 className="text-gray-900 mb-4">第3条（プライバシー）</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              当社は、ユーザーの個人情報を適切に取り扱い、プライバシーポリシーに従って管理します。
            </p>

            <h2 className="text-gray-900 mb-4">お問い合わせ</h2>
            <p className="text-gray-700 leading-relaxed">
              本規約に関するお問い合わせは、お問い合わせページよりご連絡ください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
