import { Link, useParams } from "react-router";

import { Breadcrumb } from "../components/Breadcrumb";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { PageHeader } from "../components/PageHeader";
import { PageLayout } from "../components/PageLayout";

type WorkItem = {
  title: string;
  area: string;
  size: string;
  period: string;
  beforeImage: string;
  afterImage: string;
  description: string;
  tags: string[];
};

type CategoryData = {
  title: string;
  subtitle: string;
  description: string;
  works: WorkItem[];
};

const categoryData: Record<string, CategoryData> = {
  corporate: {
    title: "法人向け施工事例",
    subtitle: "Corporate",
    description: "不動産管理会社様や施設管理者様向けの草刈り事例をご紹介します",
    works: [
      {
        title: "不動産管理会社A様 管理物件",
        area: "半田市",
        size: "約250㎡",
        period: "年間契約（年3回実施）",
        beforeImage:
          "https://images.unsplash.com/photo-1766990194564-d597b23d1de3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvdmVyZ3Jvd24lMjBncmFzcyUyMGJlZm9yZXxlbnwxfHx8fDE3Njc2ODQyMzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
        afterImage:
          "https://images.unsplash.com/photo-1766010203610-86665f86acb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFzcyUyMGN1dHRpbmclMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzY3Njg0MjM4fDA&ixlib=rb-4.1.0&q=80&w=1080",
        description:
          "複数の管理物件の定期草刈りを承っております。年間契約により、常に美観を保っています。",
        tags: ["定期管理", "複数物件", "報告書提出"],
      },
      {
        title: "商業施設B様 駐車場周辺",
        area: "東海市",
        size: "約400㎡",
        period: "スポット対応",
        beforeImage:
          "https://images.unsplash.com/photo-1752945490118-5b1518f98d77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwbGFuZCUyMG1haW50ZW5hbmNlfGVufDF8fHx8MTc2NzY4NDI0MHww&ixlib=rb-4.1.0&q=80&w=1080",
        afterImage:
          "https://images.unsplash.com/photo-1738193830098-2d92352a1856?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXduJTIwbW93aW5nJTIwc2VydmljZXxlbnwxfHx8fDE3Njc2MjE0OTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
        description:
          "来客用駐車場周辺の草刈りを実施。美観向上により、お客様からの評価も上がりました。",
        tags: ["駐車場", "商業施設", "迅速対応"],
      },
    ],
  },
  parking: {
    title: "駐車場管理",
    subtitle: "Parking",
    description: "駐車場の雑草管理と美観維持の施工事例",
    works: [
      {
        title: "月極駐車場C様",
        area: "知多市",
        size: "約200㎡",
        period: "年2回実施",
        beforeImage:
          "https://images.unsplash.com/photo-1766990194564-d597b23d1de3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvdmVyZ3Jvd24lMjBncmFzcyUyMGJlZm9yZXxlbnwxfHx8fDE3Njc2ODQyMzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
        afterImage:
          "https://images.unsplash.com/photo-1766010203610-86665f86acb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFzcyUyMGN1dHRpbmclMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzY3Njg0MjM4fDA&ixlib=rb-4.1.0&q=80&w=1080",
        description:
          "アスファルトの隙間から生える雑草を徹底的に除去。利用者様から高評価をいただいています。",
        tags: ["月極駐車場", "定期管理", "砂利補充"],
      },
    ],
  },
  solar: {
    title: "太陽光発電所",
    subtitle: "Solar",
    description: "太陽光発電施設の草刈り・維持管理事例",
    works: [
      {
        title: "太陽光発電所D様",
        area: "東浦町",
        size: "約500㎡",
        period: "年4回実施",
        beforeImage:
          "https://images.unsplash.com/photo-1758524051476-cf120cb3f1e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBnYXJkZW5pbmclMjB3b3JrfGVufDF8fHx8MTc2NzY4NDIzOXww&ixlib=rb-4.1.0&q=80&w=1080",
        afterImage:
          "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xhciUyMHBhbmVsJTIwZmllbGR8ZW58MXx8fHwxNzY3Njg0MjQwfDA&ixlib=rb-4.1.0&q=80&w=1080",
        description:
          "パネルへの影を防ぐため、定期的な草刈りを実施。発電効率の維持に貢献しています。",
        tags: ["太陽光", "発電効率維持", "年間契約"],
      },
    ],
  },
  vacant: {
    title: "空き地管理",
    subtitle: "Vacant Land",
    description: "空き地・遊休地の草刈り管理事例",
    works: [
      {
        title: "空き地E様",
        area: "常滑市",
        size: "約350㎡",
        period: "スポット対応",
        beforeImage:
          "https://images.unsplash.com/photo-1766990194564-d597b23d1de3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvdmVyZ3Jvd24lMjBncmFzcyUyMGJlZm9yZXxlbnwxfHx8fDE3Njc2ODQyMzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
        afterImage:
          "https://images.unsplash.com/photo-1766010203610-86665f86acb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFzcyUyMGN1dHRpbmclMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzY3Njg0MjM4fDA&ixlib=rb-4.1.0&q=80&w=1080",
        description: "近隣からのクレームを受けて緊急対応。迅速な作業で問題を解決しました。",
        tags: ["空き地", "緊急対応", "近隣配慮"],
      },
    ],
  },
  regular: {
    title: "定期管理",
    subtitle: "Regular",
    description: "年間契約での定期草刈り管理事例",
    works: [
      {
        title: "F施設様",
        area: "大府市",
        size: "約600㎡",
        period: "年間契約（年3回）",
        beforeImage:
          "https://images.unsplash.com/photo-1752945490118-5b1518f98d77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwbGFuZCUyMG1haW50ZW5hbmNlfGVufDF8fHx8MTc2NzY4NDI0MHww&ixlib=rb-4.1.0&q=80&w=1080",
        afterImage:
          "https://images.unsplash.com/photo-1738193830098-2d92352a1856?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXduJTIwbW93aW5nJTIwc2VydmljZXxlbnwxfHx8fDE3Njc2MjE0OTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
        description:
          "年間を通じて定期的に訪問し、常に美観を保っています。作業報告書も毎回提出。",
        tags: ["年間契約", "定期訪問", "報告書"],
      },
    ],
  },
};

export default function WorksCategoryRoute() {
  const { category } = useParams();
  const slug = category ?? "corporate";
  const data = categoryData[slug] ?? categoryData.corporate;
  const currentPath = `/works/${slug}`;

  return (
    <PageLayout>
      <PageHeader title={data.title} subtitle={data.subtitle} description={data.description} />
      <Breadcrumb
        items={[
          { label: "TOP", path: "/" },
          { label: "施工事例", path: "/works" },
          { label: data.title, path: currentPath },
        ]}
      />

      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="space-y-12">
            {data.works.map((work, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg">
                <div className="grid md:grid-cols-2 gap-6 p-6 lg:p-8">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-bold text-gray-500 mb-2">BEFORE（施工前）</div>
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <ImageWithFallback src={work.beforeImage} alt="施工前" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-emerald-600 mb-2">AFTER（施工後）</div>
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <ImageWithFallback src={work.afterImage} alt="施工後" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{work.title}</h3>
                    <p className="text-gray-700 leading-relaxed mb-6">{work.description}</p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-700 w-24">エリア：</span>
                        <span className="text-gray-600">{work.area}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-700 w-24">面積：</span>
                        <span className="text-gray-600">{work.size}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-700 w-24">契約形態：</span>
                        <span className="text-gray-600">{work.period}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {work.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center bg-white border-2 border-emerald-200 p-10 rounded-xl max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">同様のお悩みはございませんか？</h3>
            <p className="text-gray-700 mb-6">
              お気軽にご相談ください。現地の状況に合わせた最適なプランをご提案いたします
            </p>
            <Link
              to="/contact"
              className="bg-emerald-600 text-white px-8 py-4 rounded-lg hover:bg-emerald-700 transition-colors font-bold text-lg"
            >
              無料見積もりを依頼する
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
