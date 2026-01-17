import { Link } from "react-router";

import { Breadcrumb } from "../components/Breadcrumb";
import { PageHeader } from "../components/PageHeader";
import { PageLayout } from "../components/PageLayout";
import { sitemapItems } from "../components/navigation";

export default function SitemapRoute() {
  return (
    <PageLayout>
      <PageHeader title="サイトマップ" subtitle="Sitemap" backgroundImage="/page-headers/sitemap.png" />
      <Breadcrumb
        items={[
          { label: "TOP", path: "/" },
          { label: "サイトマップ", path: "/sitemap" },
        ]}
      />

      <section className="py-16 lg:py-4 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 lg:p-12">
              <ul className="space-y-6">
                {sitemapItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.path}
                      className="text-lg font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                    >
                      {item.label}
                    </Link>
                    {item.children.length > 0 ? (
                      <ul className="mt-3 ml-8 space-y-2">
                        {item.children.map((child, childIndex) => (
                          <li key={childIndex}>
                            <Link
                              to={child.path}
                              className="text-gray-700 hover:text-emerald-700 transition-colors flex items-center gap-2"
                            >
                              <span className="text-emerald-600">→</span>
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
