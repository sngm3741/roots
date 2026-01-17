import { BookOpen } from "lucide-react";
import { Link } from "react-router";

import { Breadcrumb } from "../components/Breadcrumb";
import { PageHeader } from "../components/PageHeader";
import { PageLayout } from "../components/PageLayout";
import { columns } from "../data/column";

export default function ColumnRoute() {
  return (
    <PageLayout>
      <PageHeader
        title="コラム"
        subtitle="Column"
        backgroundImage="/page-headers/column.png"
      />
      <Breadcrumb
        items={[
          { label: "TOP", path: "/" },
          { label: "コラム", path: "/column" },
        ]}
      />

      <section className="py-2 lg:py-4 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {columns.map((column) => (
                <Link
                  key={column.id}
                  to={`/column/${column.id}`}
                  className="block bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-emerald-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{column.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-start gap-2">
                        <BookOpen className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
                        <span>{column.title}</span>
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{column.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
