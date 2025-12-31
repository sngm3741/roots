export default function Contact() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-6 space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase text-slate-500 font-semibold">Static</p>
        <h1 className="text-2xl font-bold text-slate-900">お問い合わせ</h1>
        <p className="text-sm text-slate-600">ご質問・ご要望は以下の連絡先までお寄せください。</p>
      </header>

      <section className="card-surface space-y-4 rounded-3xl border border-pink-100/80 bg-white/95 p-6">
        <h2 className="text-lg font-semibold text-slate-900">連絡先</h2>
        <ul className="space-y-2 text-sm text-slate-700 leading-relaxed">
          <li>メール: info@makoto-club.com</li>
          <li>対応時間: 平日 10:00-18:00</li>
          <li>対応内容: サービスに関するお問い合わせ・権利侵害の申告・投稿削除の依頼</li>
        </ul>
        <p className="text-sm text-slate-700 leading-relaxed">
          削除依頼や権利侵害の申告は、対象URLと理由を記載してご連絡ください。
        </p>
      </section>
    </main>
  );
}
