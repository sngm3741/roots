import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/client";
import { Card } from "../../components/ui/card";
import { Select } from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import type { AnalyticsSnapshot } from "../../types";

const DAY_OPTIONS = [1, 7, 30];
const LIMIT_OPTIONS = [10, 20, 50];

const formatNumber = (value: number) => new Intl.NumberFormat("ja-JP").format(value);

export const AnalyticsPage = () => {
  const [days, setDays] = useState(7);
  const [limit, setLimit] = useState(20);
  const [data, setData] = useState<AnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getAnalytics(days, limit);
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "解析データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAnalytics();
  }, [days, limit]);

  const summary = useMemo(
    () =>
      data?.summary ?? {
        totalPageViews: 0,
        todayPageViews: 0,
        rangePageViews: 0,
        todayUniqueVisitors: 0,
        averageStaySeconds: 0,
        bounceRate: 0,
        totalOutboundClicks: 0,
        todayOutboundClicks: 0,
      },
    [data],
  );
  const daily = data?.daily ?? [];
  const paths = data?.paths ?? [];
  const landingReferrers = data?.landingReferrers ?? data?.referrers ?? [];
  const internalReferrers = data?.internalReferrers ?? [];
  const utmCampaigns = data?.utmCampaigns ?? [];
  const outboundTopStores = data?.outboundTopStores ?? [];
  const outboundRecentClicks = data?.outboundRecentClicks ?? [];

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-pink-500">Analytics</p>
        <h1 className="text-2xl font-bold">アクセス解析</h1>
        <p className="text-sm text-slate-600">
          PV・流入・滞在時間をまとめて確認できます。
        </p>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="w-36 space-y-1">
            <span className="text-xs font-semibold text-slate-500">集計期間</span>
            <Select value={String(days)} onChange={(e) => setDays(Number(e.target.value))}>
              {DAY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  直近{option}日
                </option>
              ))}
            </Select>
          </label>
          <label className="w-36 space-y-1">
            <span className="text-xs font-semibold text-slate-500">表示件数</span>
            <Select value={String(limit)} onChange={(e) => setLimit(Number(e.target.value))}>
              {LIMIT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}件
                </option>
              ))}
            </Select>
          </label>
          <Button variant="outline" onClick={() => void fetchAnalytics()} disabled={loading}>
            再取得
          </Button>
        </div>

        {data?.coverage.note && (
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {data.coverage.note}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard title="累計PV" value={formatNumber(summary.totalPageViews)} />
        <MetricCard title="今日のPV" value={formatNumber(summary.todayPageViews)} />
        <MetricCard title={`直近${days}日のPV`} value={formatNumber(summary.rangePageViews)} />
        <MetricCard title="今日の訪問者数" value={formatNumber(summary.todayUniqueVisitors)} />
        <MetricCard title="平均滞在時間" value={`${summary.averageStaySeconds} 秒`} />
        <MetricCard title="直帰率" value={`${summary.bounceRate} %`} />
        <MetricCard title="累計外部クリック" value={formatNumber(summary.totalOutboundClicks)} />
        <MetricCard title="今日の外部クリック" value={formatNumber(summary.todayOutboundClicks)} />
      </div>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">日次推移（直近{days}日）</h2>
        {loading ? (
          <p className="text-sm text-slate-500">読込中...</p>
        ) : daily.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-pink-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">日付</th>
                  <th className="px-3 py-2 text-left font-semibold">PV</th>
                  <th className="px-3 py-2 text-left font-semibold">訪問者</th>
                  <th className="px-3 py-2 text-left font-semibold">平均滞在(秒)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-100">
                {daily.map((row) => (
                  <tr key={row.date}>
                    <td className="px-3 py-2">{row.date}</td>
                    <td className="px-3 py-2">{formatNumber(row.pageViews)}</td>
                    <td className="px-3 py-2">{formatNumber(row.uniqueVisitors)}</td>
                    <td className="px-3 py-2">{row.averageStaySeconds}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">データがありません。</p>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold">ページ別PV（上位{limit}件）</h2>
          {loading ? (
            <p className="text-sm text-slate-500">読込中...</p>
          ) : paths.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-pink-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">パス</th>
                    <th className="px-3 py-2 text-left font-semibold">PV</th>
                    <th className="px-3 py-2 text-left font-semibold">構成比</th>
                    <th className="px-3 py-2 text-left font-semibold">滞在(秒)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100">
                  {paths.map((row) => (
                    <tr key={row.path}>
                      <td className="px-3 py-2">{row.path}</td>
                      <td className="px-3 py-2">{formatNumber(row.pageViews)}</td>
                      <td className="px-3 py-2">{row.sharePercent}%</td>
                      <td className="px-3 py-2">{row.averageStaySeconds}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">データがありません。</p>
          )}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold">外部流入（ランディング / 上位{limit}件）</h2>
          {loading ? (
            <p className="text-sm text-slate-500">読込中...</p>
          ) : landingReferrers.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-pink-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">流入元</th>
                    <th className="px-3 py-2 text-left font-semibold">PV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100">
                  {landingReferrers.map((row) => (
                    <tr key={row.referrer}>
                      <td className="px-3 py-2">{row.referrer}</td>
                      <td className="px-3 py-2">{formatNumber(row.pageViews)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">データがありません。</p>
          )}
        </Card>
      </div>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">内部遷移（上位{limit}件）</h2>
        {loading ? (
          <p className="text-sm text-slate-500">読込中...</p>
        ) : internalReferrers.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-pink-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">遷移元</th>
                  <th className="px-3 py-2 text-left font-semibold">PV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-100">
                {internalReferrers.map((row) => (
                  <tr key={row.referrer}>
                    <td className="px-3 py-2">{row.referrer}</td>
                    <td className="px-3 py-2">{formatNumber(row.pageViews)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">データがありません。</p>
        )}
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">UTMキャンペーン（上位{limit}件）</h2>
        {loading ? (
          <p className="text-sm text-slate-500">読込中...</p>
        ) : utmCampaigns.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-pink-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">source</th>
                  <th className="px-3 py-2 text-left font-semibold">medium</th>
                  <th className="px-3 py-2 text-left font-semibold">campaign</th>
                  <th className="px-3 py-2 text-left font-semibold">PV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-100">
                {utmCampaigns.map((row) => (
                  <tr key={`${row.source}-${row.medium}-${row.campaign}`}>
                    <td className="px-3 py-2">{row.source}</td>
                    <td className="px-3 py-2">{row.medium}</td>
                    <td className="px-3 py-2">{row.campaign}</td>
                    <td className="px-3 py-2">{formatNumber(row.pageViews)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">データがありません。</p>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold">店舗別リンククリック（上位{limit}件）</h2>
          {loading ? (
            <p className="text-sm text-slate-500">読込中...</p>
          ) : outboundTopStores.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-pink-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">店舗</th>
                    <th className="px-3 py-2 text-left font-semibold">総クリック</th>
                    <th className="px-3 py-2 text-left font-semibold">求人/公式</th>
                    <th className="px-3 py-2 text-left font-semibold">LINE</th>
                    <th className="px-3 py-2 text-left font-semibold">X</th>
                    <th className="px-3 py-2 text-left font-semibold">Bsky</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100">
                  {outboundTopStores.map((row) => (
                    <tr key={row.storeId}>
                      <td className="px-3 py-2">{row.storeName}</td>
                      <td className="px-3 py-2">{formatNumber(row.clicks)}</td>
                      <td className="px-3 py-2">{formatNumber(row.recruitmentClicks)}</td>
                      <td className="px-3 py-2">{formatNumber(row.lineClicks)}</td>
                      <td className="px-3 py-2">{formatNumber(row.xClicks)}</td>
                      <td className="px-3 py-2">{formatNumber(row.bskyClicks)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">データがありません。</p>
          )}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold">外部クリック履歴（新しい順 / 上位{limit}件）</h2>
          {loading ? (
            <p className="text-sm text-slate-500">読込中...</p>
          ) : outboundRecentClicks.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-pink-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">時刻</th>
                    <th className="px-3 py-2 text-left font-semibold">店舗</th>
                    <th className="px-3 py-2 text-left font-semibold">リンク種別</th>
                    <th className="px-3 py-2 text-left font-semibold">流入元</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100">
                  {outboundRecentClicks.map((row, index) => (
                    <tr key={`${row.occurredAt}-${row.storeId}-${row.linkType}-${index}`}>
                      <td className="px-3 py-2">{new Date(row.occurredAt).toLocaleString("ja-JP")}</td>
                      <td className="px-3 py-2">{row.storeName}</td>
                      <td className="px-3 py-2">{row.linkType}</td>
                      <td className="px-3 py-2">{row.inflowSource}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">データがありません。</p>
          )}
        </Card>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value }: { title: string; value: string }) => (
  <Card className="space-y-1 p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </Card>
);
