import { StaticPageLayout, StaticPageSection } from "../components/layout/static-page";

export default function Guideline() {
  return (
    <StaticPageLayout
      title="投稿ガイドライン"
      description="安心して利用できるよう、投稿内容の基準を定めています。"
    >
      <StaticPageSection title="1. 基本方針">
        <p className="text-sm text-slate-700 leading-relaxed">
          体験に基づく正確な情報の共有を目的としています。誹謗中傷や虚偽の投稿は認めません。
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">
          18歳未満の方はご利用できません。
        </p>
      </StaticPageSection>

      <StaticPageSection title="2. 禁止される投稿">
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 leading-relaxed">
          <li>虚偽・誇張・なりすましによる投稿</li>
          <li>他者の名誉や信用を毀損する内容</li>
          <li>個人情報（氏名、連絡先、SNSアカウント等）の掲載</li>
          <li>違法行為の助長や犯罪予告</li>
          <li>露骨な性的表現（具体的な行為の詳細描写や過度な画像）</li>
          <li>広告・勧誘・宣伝目的のみの投稿</li>
          <li>その他、運営が不適切と判断する内容</li>
        </ul>
      </StaticPageSection>

      <StaticPageSection title="3. 画像投稿の注意点">
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 leading-relaxed">
          <li>本人・第三者が特定できる画像は投稿しないでください。</li>
          <li>店舗内の禁止事項に抵触する画像は投稿しないでください。</li>
          <li>著作権・肖像権を侵害する画像は投稿できません。</li>
        </ul>
      </StaticPageSection>

      <StaticPageSection title="4. 削除・非公開の対応">
        <p className="text-sm text-slate-700 leading-relaxed">
          ガイドラインに反する投稿は、事前の通知なく削除・非公開とする場合があります。
        </p>
      </StaticPageSection>

      <StaticPageSection title="5. 通報・相談">
        <p className="text-sm text-slate-700 leading-relaxed">
          投稿内容に問題がある場合は、お問い合わせページからご連絡ください。
        </p>
      </StaticPageSection>
    </StaticPageLayout>
  );
}
