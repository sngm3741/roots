import { Calendar, User } from "lucide-react";
import { Link } from "react-router";

import { Breadcrumb } from "../components/Breadcrumb";
import { PageHeader } from "../components/PageHeader";
import { PageLayout } from "../components/PageLayout";
import { blogPosts } from "../data/blog";

export default function BlogRoute() {
  return (
    <PageLayout>
      <PageHeader
        title="ブログ"
        subtitle="Blog"
        backgroundImage="/page-headers/blog.png"
      />
      <Breadcrumb
        items={[
          { label: "TOP", path: "/" },
          { label: "ブログ", path: "/blog" },
        ]}
      />

      <section className="py-2 lg:py-4 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.id}`}
                className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
              >
                <article>
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User size={16} />
                        <span>{post.author}</span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
