import { Col } from "~/components/atoms/Col";
import { Grid12 } from "~/components/atoms/Grid12";

export function NotFoundView() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto w-full max-w-5xl">
        <Grid12 gap="6" className="text-center">
          <Col span={12} mdSpan={8} start={1} className="md:col-start-3">
            <Grid12 gap="3">
              <Col span={12}>
                <p className="text-xs tracking-[0.5em] text-lilink-muted">
                  404
                </p>
              </Col>
              <Col span={12}>
                <h1 className="text-2xl font-semibold">
                  プロフィールが見つかりません
                </h1>
              </Col>
              <Col span={12}>
                <p className="text-sm text-lilink-muted">
                  URL を確認して、もう一度アクセスしてください。
                </p>
              </Col>
            </Grid12>
          </Col>
        </Grid12>
      </div>
    </main>
  );
}
