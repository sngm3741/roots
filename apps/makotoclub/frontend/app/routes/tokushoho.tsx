import { StaticPageLayout, StaticPageSection } from "../components/layout/static-page";

export default function Tokushoho() {
  return (
    <StaticPageLayout
      title="特定商取引法に基づく表記"
      description="本ページは暫定版です。運営者情報は確定後に更新します。公開前に必ず最新情報へ差し替えてください。"
    >
      <StaticPageSection>
        <div className="grid gap-4 text-sm text-slate-700">
          <div>
            <p className="text-xs font-semibold text-slate-500">事業者名</p>
            <p>（未確定）合同会社マコトクラブ（仮）</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">運営責任者</p>
            <p>（未確定）</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">所在地</p>
            <p>（未確定）</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">連絡先</p>
            <p>support@makoto-club.jp</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">販売価格（掲載料）</p>
            <p>掲載内容ごとに個別にお見積りします。</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">商品代金以外の必要料金</p>
            <p>銀行振込手数料等の支払に必要な費用。</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">支払方法</p>
            <p>銀行振込（予定）</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">支払時期</p>
            <p>掲載開始前までにお支払い。</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">役務の提供時期</p>
            <p>入金確認後に掲載開始。</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">キャンセル・返金</p>
            <p>掲載開始後のキャンセル・返金は原則不可。</p>
          </div>
        </div>
      </StaticPageSection>
    </StaticPageLayout>
  );
}
