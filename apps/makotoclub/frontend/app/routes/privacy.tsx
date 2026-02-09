import { StaticPageLayout, StaticPageSection } from "../components/layout/static-page";

export default function Privacy() {
  return (
    <StaticPageLayout
      title="プライバシーポリシー"
      description="個人情報の取り扱いについて記載しています。"
    >
      <StaticPageSection title="1. 収集する情報">
        <p className="text-sm text-slate-700 leading-relaxed">
          本サービスは、提供に必要な範囲で以下の情報を取得します。
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 leading-relaxed">
          <li>アンケート内容（本文、選択項目、任意コメント）</li>
          <li>投稿された画像</li>
          <li>任意で入力された連絡先（メールアドレス）</li>
          <li>アクセスログ（IPアドレス、User-Agent、リクエストパス、メソッド、ステータス、日時）</li>
          <li>アクセス解析情報（閲覧ページ、流入元ホスト、UTMパラメータ、滞在時間の推定値）</li>
          <li>アクセス解析用Cookie（セッション識別子。Cookie名: `mc_sid`）</li>
        </ul>
      </StaticPageSection>

      <StaticPageSection title="2. 利用目的">
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 leading-relaxed">
          <li>本サービスの提供・運営</li>
          <li>投稿内容の表示、管理、品質維持</li>
          <li>不正行為や権利侵害への対応</li>
          <li>お問い合わせ対応</li>
          <li>サービス改善や品質向上</li>
          <li>ページ閲覧数・滞在傾向・流入元の把握による導線改善</li>
        </ul>
      </StaticPageSection>

      <StaticPageSection title="3. 保存期間">
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 leading-relaxed">
          <li>アクセスログ（不正対策・権利侵害対応）は取得日から1年間保存します。</li>
          <li>アクセス解析データ（PV、滞在時間推定、流入情報）は取得日から30日間保存します。</li>
          <li>アクセス解析用Cookie（`mc_sid`）の有効期間は30日です。</li>
          <li>その他の情報は、利用目的の達成に必要な期間に限り保存します。</li>
        </ul>
      </StaticPageSection>

      <StaticPageSection title="4. 第三者提供・委託">
        <p className="text-sm text-slate-700 leading-relaxed">
          法令に基づく場合を除き、第三者への提供は行いません。なお、サービス運営上必要な範囲で、インフラ提供事業者に業務を委託する場合があります。
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 leading-relaxed">
          <li>Cloudflare（ホスティング、ストレージ、ログ基盤）</li>
        </ul>
      </StaticPageSection>

      <StaticPageSection title="5. 安全管理措置">
        <p className="text-sm text-slate-700 leading-relaxed">
          当サービスは、取得した情報の漏えい、滅失、毀損の防止その他安全管理のために必要かつ適切な措置を講じます。
        </p>
      </StaticPageSection>

      <StaticPageSection title="6. 開示・訂正・削除">
        <p className="text-sm text-slate-700 leading-relaxed">
          開示・訂正・削除のご希望は、お問い合わせページからご連絡ください。合理的な範囲で対応します。
        </p>
      </StaticPageSection>

      <StaticPageSection title="7. 開示請求への対応">
        <p className="text-sm text-slate-700 leading-relaxed">
          法令に基づく開示請求があった場合、適切な手続きに従い対応します。
        </p>
      </StaticPageSection>

      <StaticPageSection title="8. 改定">
        <p className="text-sm text-slate-700 leading-relaxed">
          本ポリシーは、必要に応じて変更します。変更後は本ページに掲載した時点から効力を生じます。
        </p>
      </StaticPageSection>
    </StaticPageLayout>
  );
}
