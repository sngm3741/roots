import { StaticPageLayout, StaticPageSection } from "../components/layout/static-page";

export default function Contact() {
  return (
    <StaticPageLayout
      title="お問い合わせ"
      description="ご質問・ご要望は以下の連絡先までお寄せください。"
    >
      <StaticPageSection title="連絡先">
        <ul className="space-y-2 text-sm text-slate-700 leading-relaxed">
          <li>メール: info@makoto-club.com</li>
          <li>対応時間: 平日 10:00-18:00</li>
          <li>対応内容: サービスに関するお問い合わせ・権利侵害の申告・投稿削除の依頼</li>
        </ul>
        <p className="text-sm text-slate-700 leading-relaxed">
          削除依頼や権利侵害の申告は、対象URLと理由を記載してご連絡ください。
        </p>
      </StaticPageSection>
    </StaticPageLayout>
  );
}
