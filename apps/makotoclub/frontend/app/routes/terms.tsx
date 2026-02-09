import { StaticPageLayout, StaticPageSection } from "../components/layout/static-page";

export default function Terms() {
  return (
    <StaticPageLayout
      title="利用規約"
      description="サービス利用にあたっての条項を確認してください。"
    >
      <StaticPageSection title="第1条（適用）">
        <p className="text-sm text-slate-700 leading-relaxed">
          本規約は、本サービスの利用に関する条件を定めるものです。ユーザーは本サービスを利用することで、本規約に同意したものとみなされます。
        </p>
      </StaticPageSection>

      <StaticPageSection title="第2条（利用条件）">
        <p className="text-sm text-slate-700 leading-relaxed">
          当サービスは18歳未満の方の利用を禁止します。ユーザーは本規約および法令を遵守して利用するものとします。
        </p>
      </StaticPageSection>

      <StaticPageSection title="第3条（投稿コンテンツの取扱い）">
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 leading-relaxed">
          <li>投稿コンテンツの責任は投稿者に帰属します。</li>
          <li>投稿者は、投稿に必要な権利を有し、第三者の権利を侵害しないことを保証するものとします。</li>
          <li>
            投稿者は、当サービスが投稿コンテンツを本サービスの運営・改善・告知に必要な範囲で、複製・編集・公開できることに同意するものとします。
          </li>
          <li>当サービスは、投稿コンテンツの正確性・完全性・合法性を保証しません。</li>
          <li>当サービスは、ガイドライン違反等の場合、投稿を予告なく削除できるものとします。</li>
        </ul>
      </StaticPageSection>

      <StaticPageSection title="第4条（禁止事項）">
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 leading-relaxed">
          <li>法令または公序良俗に違反する行為</li>
          <li>本サービスの運営を妨害する行為</li>
          <li>他のユーザーに不利益・損害を与える行為</li>
          <li>虚偽の体験談や誤解を招く内容の投稿</li>
          <li>他者になりすます行為</li>
        </ul>
      </StaticPageSection>

      <StaticPageSection title="第5条（広告・掲載）">
        <p className="text-sm text-slate-700 leading-relaxed">
          本サービスは店舗情報や広告を掲載する場合がありますが、職業紹介や募集情報提供を行うものではありません。
        </p>
      </StaticPageSection>

      <StaticPageSection title="第6条（免責事項）">
        <p className="text-sm text-slate-700 leading-relaxed">
          本サービスの利用により発生したいかなる損害についても、運営者は一切の責任を負いません。ユーザーは自己責任で本サービスを利用するものとします。
        </p>
      </StaticPageSection>

      <StaticPageSection title="第7条（個人情報）">
        <p className="text-sm text-slate-700 leading-relaxed">
          当サービスの個人情報の取扱いは、プライバシーポリシーに従います。
        </p>
      </StaticPageSection>

      <StaticPageSection title="第8条（準拠法・管轄）">
        <p className="text-sm text-slate-700 leading-relaxed">
          本規約の準拠法は日本法とし、本サービスに関して紛争が生じた場合、東京地方裁判所を専属的合意管轄裁判所とします。
        </p>
      </StaticPageSection>
    </StaticPageLayout>
  );
}
