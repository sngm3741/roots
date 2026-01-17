import { Calendar, User } from "lucide-react";
import { Link, useParams } from "react-router";

import { Breadcrumb } from "../components/Breadcrumb";
import { PageHeader } from "../components/PageHeader";
import { PageLayout } from "../components/PageLayout";
import { blogPosts } from "../data/blog";

export default function BlogDetailRoute() {
  const { slug } = useParams();
  const post = blogPosts.find((item) => item.id === slug);

  return (
    <PageLayout>
      <PageHeader
        title={post?.title ?? "ブログ"}
        subtitle="Blog"
        backgroundImage="/page-headers/blog.png"
      />
      <Breadcrumb
        items={[
          { label: "TOP", path: "/" },
          { label: "ブログ", path: "/blog" },
          { label: post?.title ?? "記事詳細", path: "" },
        ]}
      />

      <section className="py-8 lg:py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          {post ? (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="aspect-video bg-gray-100">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={16} />
                      <span>{post.author}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-8">
                    {post.lead}
                  </p>

                  <div className="space-y-6 text-gray-700">
                    {post.sections.map((section, index) => (
                      <div key={`${section.heading}-${index}`}>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">{section.heading}</h2>
                        <p className="leading-relaxed">{section.body}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 border-t border-gray-200 pt-6">
                    <Link
                      to="/blog"
                      className="text-emerald-700 font-bold hover:text-emerald-800 transition-colors"
                    >
                      ← ブログ一覧へ戻る
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl shadow-lg p-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4">記事が見つかりません</h2>
              <p className="text-gray-600 mb-6">一覧に戻って別の記事をご覧ください。</p>
              <Link
                to="/blog"
                className="inline-flex items-center justify-center bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors"
              >
                ブログ一覧へ
              </Link>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
