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
    <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-24">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">よくある質問</h1>
        <p className="text-sm text-slate-600">
          アンケートやサイトの使い方についての質問をまとめています。
        </p>
      </header>

      <section className="mt-8 space-y-4">
        {faqs.map((faq) => (
          <div
            key={faq.question}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-sm font-semibold text-slate-900">{faq.question}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
