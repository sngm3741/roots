import { BookOpen } from "lucide-react";
import { Link, useParams } from "react-router";

import { Breadcrumb } from "../components/Breadcrumb";
import { PageHeader } from "../components/PageHeader";
import { PageLayout } from "../components/PageLayout";
import { columns } from "../data/column";

export default function ColumnDetailRoute() {
  const { slug } = useParams();
  const column = columns.find((item) => item.id === slug);

  return (
    <PageLayout>
      <PageHeader
        title={column?.title ?? "コラム"}
        subtitle="Column"
        backgroundImage="/page-headers/column.png"
      />
      <Breadcrumb
        items={[
          { label: "TOP", path: "/" },
          { label: "コラム", path: "/column" },
          { label: column?.title ?? "記事詳細", path: "" },
        ]}
      />

      <section className="py-8 lg:py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          {column ? (
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{column.icon}</span>
                <div className="flex items-center gap-2 text-emerald-700 text-sm font-bold">
                  <BookOpen size={18} />
                  <span>現場コラム</span>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{column.title}</h1>
              <p className="text-gray-700 leading-relaxed mb-4">{column.description}</p>
              <p className="text-gray-700 leading-relaxed mb-8">{column.lead}</p>

              <div className="space-y-6 text-gray-700">
                {column.sections.map((section, index) => (
                  <div key={`${section.heading}-${index}`}>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">{section.heading}</h2>
                    <p className="leading-relaxed">{section.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 border-t border-gray-200 pt-6">
                <Link
                  to="/column"
                  className="text-emerald-700 font-bold hover:text-emerald-800 transition-colors"
                >
                  ← コラム一覧へ戻る
                </Link>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl shadow-lg p-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4">記事が見つかりません</h2>
              <p className="text-gray-600 mb-6">一覧に戻って別の記事をご覧ください。</p>
              <Link
                to="/column"
                className="inline-flex items-center justify-center bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors"
              >
                コラム一覧へ
              </Link>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
