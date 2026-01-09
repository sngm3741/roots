export function NotFoundView() {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-16">
      <div className="grid w-full max-w-md gap-6 text-center">
        <p className="text-xs tracking-[0.5em] text-lilink-muted">404</p>
        <div className="grid gap-3">
          <h1 className="text-2xl font-semibold">プロフィールが見つかりません</h1>
          <p className="text-sm text-lilink-muted">
            URL を確認して、もう一度アクセスしてください。
          </p>
        </div>
      </div>
    </main>
  );
}
