import { Link } from "react-router";

import { Breadcrumb } from "../components/Breadcrumb";
import { PageHeader } from "../components/PageHeader";
import { PageLayout } from "../components/PageLayout";
import { Works } from "../components/Works";

export default function WorksRoute() {
  const categories = [
    { title: "法人向け", path: "/works/corporate", description: "不動産管理会社様向けの施工事例" },
    { title: "駐車場管理", path: "/works/parking", description: "駐車場の草刈り事例" },
    { title: "太陽光発電所", path: "/works/solar", description: "太陽光発電所の維持管理事例" },
    { title: "空き地管理", path: "/works/vacant", description: "空き地の草刈り事例" },
    { title: "定期管理", path: "/works/regular", description: "年間契約での定期管理事例" },
  ];

  return (
    <PageLayout>
      <PageHeader title="施工事例" subtitle="Works" description="これまでの施工実績をご紹介します" />
      <Breadcrumb
        items={[
          { label: "TOP", path: "/" },
          { label: "施工事例", path: "/works" },
        ]}
      />

      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.path}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-emerald-500 hover:shadow-lg transition-all text-left"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </Link>
            ))}
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">最近の施工事例</h2>
          </div>
          <Works />
        </div>
      </section>
    </PageLayout>
  );
}
