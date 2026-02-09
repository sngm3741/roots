import { StaticPageLayout, StaticPageSection } from "../components/layout/static-page";

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
    <StaticPageLayout
      title="運営会社情報"
      description="MakotoClubの運営方針と活動の目的をご紹介します。"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {highlights.map((item) => (
          <StaticPageSection key={item.title} title={item.title}>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
          </StaticPageSection>
        ))}
      </div>

      <StaticPageSection title="会社概要">
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
      </StaticPageSection>
    </StaticPageLayout>
  );
}
