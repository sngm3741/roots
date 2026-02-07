const stories = [
  {
    name: "Aさん",
    role: "デリヘル店勤務",
    title: "指名が取れるまでの最初の3ヶ月",
    summary:
      "写メ日記の工夫と出勤リズムで、少しずつ指名が増えていったリアルな体験談。",
    youtubeId: "dQw4w9WgXcQ",
  },
  {
    name: "Bさん",
    role: "ソープ勤務",
    title: "初出勤の不安と、乗り越えた方法",
    summary: "最初の壁と向き合った時に意識したこと、現場で助けになったこと。",
    youtubeId: "dQw4w9WgXcQ",
  },
];

export default function StoriesPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-24">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">体験談ストーリーズ</h1>
        <p className="text-sm text-slate-600">
          現場で働く人の声を集めたテキスト + 動画の体験談シリーズです。
        </p>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        {stories.map((story) => (
          <article
            key={story.title}
            className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div>
              <p className="text-xs font-semibold text-pink-500">{story.role}</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">{story.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{story.summary}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${story.youtubeId}`}
                  title={`${story.name}の体験談`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
            <div className="text-xs text-slate-500">出演: {story.name}</div>
          </article>
        ))}
      </section>
    </main>
  );
}
