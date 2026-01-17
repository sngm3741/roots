import { Breadcrumb } from "../components/Breadcrumb";
import { PageHeader } from "../components/PageHeader";
import { PageLayout } from "../components/PageLayout";

export default function CompanyRoute() {
  const companyInfo = [
    { label: "会社名", value: "知多草刈りサービス" },
    { label: "代表者", value: "代表取締役 山田太郎" },
    { label: "所在地", value: "愛知県知多市〇〇町△丁目□番地" },
    { label: "電話番号", value: "080-6955-6096" },
    { label: "営業時間", value: "9:00〜18:00（土日祝も対応¥可）" },
    { label: "定休日", value: "不定休" },
    { label: "対応エリア", value: "知多半島全域" },
    { label: "事業内容", value: "草刈り・除草、伐採作業、道路の舗装工事" },
  ];

  return (
    <PageLayout>
      <PageHeader
        title="会社概要"
        subtitle="Company"
        backgroundImage="/page-headers/company.png"
      />
      <Breadcrumb
        items={[
          { label: "TOP", path: "/" },
          { label: "会社概要", path: "/company" },
        ]}
      />

      <section className="py-2 lg:py-4 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <tbody>
                {companyInfo.map((info, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <th className="text-left px-6 py-4 font-bold text-gray-900 w-1/3 border-b border-gray-200">
                      {info.label}
                    </th>
                    <td className="px-6 py-4 text-gray-700 border-b border-gray-200">
                      {info.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
