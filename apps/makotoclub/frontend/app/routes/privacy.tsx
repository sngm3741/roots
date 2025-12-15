export default function Privacy() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-6 space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase text-slate-500 font-semibold">Static</p>
        <h1 className="text-2xl font-bold text-slate-900">プライバシーポリシー</h1>
        <p className="text-sm text-slate-600">個人情報の取り扱いについて記載しています。</p>
      </header>

      <section className="card-surface space-y-4 rounded-3xl border border-pink-100/80 bg-white/95 p-6">
        <h2 className="text-lg font-semibold text-slate-900">1. 収集する情報</h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          本サービスでは、アンケート投稿に関連してメールアドレス・画像データなどを収集する場合があります。
        </p>
      </section>

      <section className="card-surface space-y-4 rounded-3xl border border-pink-100/80 bg-white/95 p-6">
        <h2 className="text-lg font-semibold text-slate-900">2. 利用目的</h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          収集した情報は、本サービスの提供・改善およびユーザーからの問い合わせ対応のために使用します。
        </p>
      </section>

      <section className="card-surface space-y-4 rounded-3xl border border-pink-100/80 bg-white/95 p-6">
        <h2 className="text-lg font-semibold text-slate-900">3. 開示・提供</h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          法令に基づく場合を除き、第三者への開示や提供は行いません。
        </p>
      </section>
    </main>
  );
}

