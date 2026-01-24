import type { Route } from "./+types/test";
import { Col } from "~/components/atoms/Col";
import { Grid12 } from "~/components/atoms/Grid12";
import { Variant } from "~/components/molecules/variant/Variant";

export const meta: Route.MetaFunction = () => [
  { title: "variant テスト | lilink" },
];

export default function VariantTestRoute() {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto w-full max-w-6xl">
        <Grid12 gap="6" className="mt-8">
          <Col span={12}>
            <Variant
              pattern="hero"
              size="l"
              thumbnailUrl="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80"
              title="プロフィールはこちら"
              description="トップに戻るリンク。活動の入口。"
              url="https://kiriko.lilink.link"
            />
          </Col>

          <Col span={12}>
            <Variant
              pattern="info"
              title="最新の予定"
              description="直近の出演情報や告知をまとめて表示します。"
            />
          </Col>

          <Col span={12}>
            <Grid12 gap="4">
              {[
                { title: "X", url: "https://x.com", desc: "メイン" },
                { title: "Bluesky", url: "https://bsky.app", desc: "別軸" },
                { title: "Instagram", url: "https://instagram.com", desc: "写真" },
                { title: "LINE", url: "https://line.me", desc: "連絡" },
                { title: "YouTube", url: "https://youtube.com", desc: "動画" },
              ].map((item) => (
                <Col key={item.title} span={6} smSpan={4} mdSpan={2}>
                  <Variant
                    pattern="social"
                    size="s"
                    thumbnailUrl="https://cdn-icons-png.flaticon.com/512/733/733579.png"
                    title={item.title}
                    description={item.desc}
                    url={item.url}
                    showUrl={false}
                    position="center"
                  />
                </Col>
              ))}
            </Grid12>
          </Col>

          <Col span={12}>
            <Variant
              pattern="primary"
              title="ブログ"
              description="日々のプレイ日記とイベント情報はこちら"
              url="https://kiriko07.blog.fc2.com/"
              thumbnailUrl="https://blog-imgs-113.fc2.com/o/o/p/oops0011/2019-09-14-fc2-logo386-comp.png"
            />
          </Col>

          <Col span={12}>
            <Grid12 gap="3">
              {[
                "❤️ プレイ日記",
                "【平日昼間の会】",
                "【平日夜の会】",
                "【お仕置きBAR】🕐1/31(土) 19:00~（むぎ茶ママ）",
              ].map((title) => (
                <Col key={title} span={12}>
                  <Variant
                    pattern="child"
                    title={title}
                    description="詳細・告知"
                    url="https://kiriko07.blog.fc2.com/"
                  />
                </Col>
              ))}
            </Grid12>
          </Col>
        </Grid12>
      </div>
    </main>
  );
}
