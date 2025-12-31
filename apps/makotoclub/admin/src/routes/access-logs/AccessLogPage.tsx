import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/client";
import type { AccessLogEntry } from "../../types";
import { Button } from "../../components/ui/button";

type ListState = {
  items: AccessLogEntry[];
  total: number;
};

const LIMIT = 50;

export const AccessLogPage = () => {
  const [data, setData] = useState<ListState>({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminApi.listAccessLogs(page, LIMIT);
        setData({ items: res.items, total: res.total });
      } catch (err) {
        setError(err instanceof Error ? err.message : "取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [page]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(data.total / LIMIT)),
    [data.total],
  );

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-pink-500">Access Logs</p>
        <h1 className="text-2xl font-bold">アクセスログ</h1>
        <p className="text-sm text-slate-600">
          直近1年分の投稿・アップロードのみを表示します。
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-pink-100 bg-white/95 shadow-sm">
        <div className="flex items-center justify-between border-b border-pink-100 px-4 py-3 text-sm text-slate-600">
          <span>合計 {data.total} 件</span>
          <span>1ページ {LIMIT} 件</span>
        </div>

        {loading ? (
          <div className="px-4 py-6 text-sm text-slate-600">読込中...</div>
        ) : data.items.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-600">ログがありません。</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-pink-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">日時</th>
                  <th className="px-4 py-3 text-left font-semibold">パス</th>
                  <th className="px-4 py-3 text-left font-semibold">メソッド</th>
                  <th className="px-4 py-3 text-left font-semibold">ステータス</th>
                  <th className="px-4 py-3 text-left font-semibold">IP（マスク）</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-100">
                {data.items.map((item, index) => (
                  <tr key={`${item.createdAt}-${item.path}-${index}`}>
                    <td className="px-4 py-3 text-slate-700">{item.createdAt}</td>
                    <td className="px-4 py-3 text-slate-700">{item.path}</td>
                    <td className="px-4 py-3 text-slate-700">{item.method}</td>
                    <td className="px-4 py-3 text-slate-700">{item.status}</td>
                    <td className="px-4 py-3 text-slate-700">{item.ipMasked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={page <= 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          前へ
        </Button>
        <span className="text-sm text-slate-600">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
        >
          次へ
        </Button>
      </div>
    </div>
  );
};
