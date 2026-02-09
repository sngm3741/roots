import { StaticPageLayout, StaticPageSection } from "../components/layout/static-page";

const faqs = [
  {
    question: "アンケートは誰でも投稿できますか？",
    answer:
      "はい。投稿ガイドラインに沿って、必要事項を入力すればどなたでも投稿できます。",
  },
  {
    question: "情報の修正や削除はできますか？",
    answer:
      "内容に不備がある場合は、お問い合わせからご連絡ください。確認のうえ対応します。",
  },
  {
    question: "投稿したアンケートは公開までに時間がかかりますか？",
    answer:
      "基本的には即時反映されますが、内容によっては確認のため反映が遅れる場合があります。",
  },
  {
    question: "年齢やスペックは必須ですか？",
    answer:
      "参考になりやすいように、年齢と身長・体重（またはスペ）をご入力ください。",
  },
];

export default function FaqPage() {
  return (
    <StaticPageLayout
      title="よくある質問"
      description="アンケートやサイトの使い方についての質問をまとめています。"
    >
      <div className="space-y-4">
        {faqs.map((faq) => (
          <StaticPageSection key={faq.question} title={faq.question}>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
          </StaticPageSection>
        ))}
      </div>
    </StaticPageLayout>
  );
}
