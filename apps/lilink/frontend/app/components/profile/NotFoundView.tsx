export function NotFoundView() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto w-full max-w-5xl">
        <div className="grid grid-cols-12 gap-6 text-center">
          <div className="col-span-12 md:col-start-3 md:col-span-8">
            <div className="grid grid-cols-12 gap-3">
              <p className="col-span-12 text-xs tracking-[0.5em] text-lilink-muted">
                404
              </p>
              <h1 className="col-span-12 text-2xl font-semibold">
                プロフィールが見つかりません
              </h1>
              <p className="col-span-12 text-sm text-lilink-muted">
                URL を確認して、もう一度アクセスしてください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
