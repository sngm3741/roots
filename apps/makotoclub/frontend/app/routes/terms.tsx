export default function Terms() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-6 space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase text-slate-500 font-semibold">Static</p>
        <h1 className="text-2xl font-bold text-slate-900">利用規約</h1>
        <p className="text-sm text-slate-600">サービス利用にあたっての条項を確認してください。</p>
      </header>

      <section className="card-surface space-y-4 rounded-3xl border border-pink-100/80 bg-white/95 p-6">
        <h2 className="text-lg font-semibold text-slate-900">第1条（適用）</h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          本規約は、本サービスの利用に関する条件を定めるものです。ユーザーは本サービスを利用することで、本規約に同意したものとみなされます。
        </p>
      </section>

      <section className="card-surface space-y-4 rounded-3xl border border-pink-100/80 bg-white/95 p-6">
        <h2 className="text-lg font-semibold text-slate-900">第2条（禁止事項）</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 leading-relaxed">
          <li>法令または公序良俗に違反する行為</li>
          <li>本サービスの運営を妨害する行為</li>
          <li>他のユーザーに不利益・損害を与える行為</li>
        </ul>
      </section>

      <section className="card-surface space-y-4 rounded-3xl border border-pink-100/80 bg-white/95 p-6">
        <h2 className="text-lg font-semibold text-slate-900">第3条（免責事項）</h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          本サービスの利用により発生したいかなる損害についても、運営者は一切の責任を負いません。ユーザーは自己責任で本サービスを利用するものとします。
        </p>
      </section>
    </main>
  );
}

