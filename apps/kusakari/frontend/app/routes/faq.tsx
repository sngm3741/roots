import { useState } from "react";
import { Link } from "react-router";
import { ChevronDown } from "lucide-react";

import { Breadcrumb } from "../components/Breadcrumb";
import { PageHeader } from "../components/PageHeader";
import { PageLayout } from "../components/PageLayout";

export default function FaqRoute() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      category: "サービスについて",
      items: [
        {
          question: "対応エリアはどこですか？",
          answer:
            "知多半島全域（半田市、常滑市、東海市、大府市、知多市、東浦町、阿久比町、武豊町、美浜町、南知多町）が対応エリアです。エリア外でも規模や条件によっては対応可能な場合がございますので、まずはお問い合わせください。",
        },
        {
          question: "見積もりは無料ですか？",
          answer:
            "はい、お見積もりは無料です。現地の写真をお送りいただければ、概算見積もりも可能です。より正確なお見積もりをご希望の場合は、現地調査（無料）も承っております。",
        },
        {
          question: "最短でどれくらいで作業できますか？",
          answer: "お問い合わせから最短3営業日で作業可能です。緊急の場合はご相談ください。できる限り柔軟に対応いたします。",
        },
        {
          question: "作業時間はどれくらいかかりますか？",
          answer: "面積や草の状態によって異なりますが、100㎡程度であれば2〜3時間程度が目安です。詳しくはお見積もり時にお伝えいたします。",
        },
      ],
    },
    {
      category: "料金について",
      items: [
        {
          question: "料金はどのように決まりますか？",
          answer:
            "基本的には作業面積（㎡）で算出いたします。ただし、傾斜地や障害物が多い場合、機械が入れない場所などは追加料金が発生する場合がございます。お見積もり時に詳細をご説明いたします。",
        },
        {
          question: "支払い方法は何がありますか？",
          answer: "銀行振込、現金払いに対応しております。法人のお客様は請求書払いも可能です。",
        },
        {
          question: "定期契約の場合、割引はありますか？",
          answer: "はい、年間契約での定期管理の場合は割引価格にて対応させていただきます。詳しくはお問い合わせください。",
        },
      ],
    },
    {
      category: "作業内容について",
      items: [
        {
          question: "刈った草はどうなりますか？",
          answer: "基本料金に刈草の回収・処分が含まれております。安心してお任せください。",
        },
        {
          question: "雨の日でも作業できますか？",
          answer:
            "小雨程度であれば作業可能ですが、安全を最優先するため、強い雨や悪天候の場合は延期させていただく場合がございます。",
        },
        {
          question: "立ち会いは必要ですか？",
          answer:
            "基本的には立ち会い不要です。ただし、初回や現地調査時はできる限りご在宅をお願いしております。作業後は写真付きの報告書をお送りいたします。",
        },
        {
          question: "樹木の伐採もできますか？",
          answer: "はい、小規模な樹木の伐採にも対応しております。大規模な伐採の場合は専門業者をご紹介することも可能です。",
        },
      ],
    },
    {
      category: "法人のお客様向け",
      items: [
        {
          question: "複数の物件をまとめて依頼できますか？",
          answer: "はい、可能です。複数物件を一括でご依頼いただく場合は、割引価格にて対応させていただきます。",
        },
        {
          question: "作業報告書は発行できますか？",
          answer: "はい、作業完了後に写真付きの報告書を発行いたします。PDF形式でのメール送付も可能です。",
        },
        {
          question: "定期的な管理をお願いできますか？",
          answer:
            "はい、年間契約での定期管理も承っております。年3回〜のご訪問など、お客様のご要望に応じてスケジュールを組ませていただきます。",
        },
      ],
    },
  ];

  const toggleFaq = (categoryIndex: number, itemIndex: number) => {
    const index = categoryIndex * 100 + itemIndex;
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <PageLayout>
      <PageHeader title="よくある質問" subtitle="FAQ" description="お客様からよくいただくご質問にお答えします" />
      <Breadcrumb
        items={[
          { label: "TOP", path: "/" },
          { label: "よくある質問", path: "/faq" },
        ]}
      />

      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-emerald-600">
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => {
                    const index = categoryIndex * 100 + itemIndex;
                    const isOpen = openIndex === index;

                    return (
                      <div
                        key={itemIndex}
                        className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-emerald-300 transition-colors"
                      >
                        <button
                          onClick={() => toggleFaq(categoryIndex, itemIndex)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-bold text-gray-900 pr-4 flex items-start gap-3">
                            <span className="text-emerald-600 flex-shrink-0">Q.</span>
                            <span>{item.question}</span>
                          </span>
                          <ChevronDown
                            className={`text-emerald-600 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                            size={24}
                          />
                        </button>
                        {isOpen ? (
                          <div className="px-6 pb-4 pt-2 bg-emerald-50">
                            <p className="text-gray-700 leading-relaxed flex gap-3">
                              <span className="text-emerald-600 font-bold flex-shrink-0">A.</span>
                              <span>{item.answer}</span>
                            </p>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center bg-white border-2 border-emerald-200 p-10 rounded-xl max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">その他のご質問はお気軽にお問い合わせください</h3>
            <p className="text-gray-700 mb-6">専門スタッフが丁寧にお答えいたします</p>
            <Link
              to="/contact"
              className="bg-emerald-600 text-white px-8 py-4 rounded-lg hover:bg-emerald-700 transition-colors font-bold text-lg"
            >
              お問い合わせはこちら
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
