const highlights = [
  {
    title: "運営ミッション",
    body: "リアルな体験談を集め、働く人が納得して選べる情報を整えます。",
  },
  {
    title: "運営スタンス",
    body: "投稿者の安全とプライバシーを最優先に、透明性のある運営を心がけます。",
  },
  {
    title: "お問い合わせ",
    body: "掲載・提携のご相談はお問い合わせページからご連絡ください。",
  },
];

export default function CompanyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-24">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">運営会社情報</h1>
        <p className="text-sm text-slate-600">
          MakotoClubの運営方針と活動の目的をご紹介します。
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {highlights.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-sm font-semibold text-slate-900">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
        <p className="font-semibold">会社概要</p>
        <dl className="mt-3 space-y-2 text-sm text-slate-600">
          <div className="flex justify-between gap-4">
            <dt>会社名</dt>
            <dd>準備中</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>所在地</dt>
            <dd>準備中</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>事業内容</dt>
            <dd>情報プラットフォーム運営</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
