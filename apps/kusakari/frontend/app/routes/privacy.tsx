import { Breadcrumb } from "../components/Breadcrumb";
import { PageHeader } from "../components/PageHeader";
import { PageLayout } from "../components/PageLayout";

export default function PrivacyRoute() {
  return (
    <PageLayout>
      <PageHeader title="プライバシーポリシー" subtitle="Privacy Policy" description="個人情報の取り扱いについて" />
      <Breadcrumb
        items={[
          { label: "TOP", path: "/" },
          { label: "プライバシーポリシー", path: "/privacy" },
        ]}
      />

      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto prose prose-emerald">
            <div className="space-y-8 text-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">個人情報の取り扱いについて</h2>
                <p className="leading-relaxed">
                  知多草刈りサービス（以下「当社」）は、お客様の個人情報保護の重要性について認識し、個人情報の保護に関する法律（以下「個人情報保護法」）を遵守すると共に、以下のプライバシーポリシー（以下「本ポリシー」）に従い、適切な取扱い及び保護に努めます。
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">1. 個人情報の定義</h3>
                <p className="leading-relaxed">
                  本ポリシーにおいて、個人情報とは、個人情報保護法第2条第1項により定義された個人情報、すなわち、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日その他の記述等により特定の個人を識別することができるもの、および個人識別符号が含まれるものを指します。
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">2. 個人情報の利用目的</h3>
                <p className="leading-relaxed mb-2">当社は、お客様の個人情報を以下の目的で利用いたします：</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>サービスの提供・運営のため</li>
                  <li>お客様からのお問い合わせに回答するため</li>
                  <li>見積もり・契約に関する連絡のため</li>
                  <li>サービスに関するご案内のため</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">3. 個人情報の第三者提供</h3>
                <p className="leading-relaxed">
                  当社は、お客様の個人情報を、あらかじめお客様の同意を得ることなく、第三者に提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">4. お問い合わせ窓口</h3>
                <p className="leading-relaxed">本ポリシーに関するお問い合わせは、下記の窓口までお願いいたします。</p>
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <p>知多草刈りサービス</p>
                  <p>電話：052-XXX-XXXX</p>
                  <p>メール：info@example.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
