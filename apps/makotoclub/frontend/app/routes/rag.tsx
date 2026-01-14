import { type FormEvent, useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { StoreCard } from "../components/cards/store-card";
import type { StoreSummary } from "../types/store";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  results?: { picks: StoreSummary[] } | null;
  showTopLink?: boolean;
};

type ChatResponse = {
  reply: string;
  filters: { age: number; spec: number } | null;
  results: { picks: StoreSummary[] } | null;
  showTopLink?: boolean;
};

export default function RagPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialThinking, setInitialThinking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([{ role: "assistant", content: "年齢とスペ教えて？" }]);
      setInitialThinking(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const sendMessage = async (text: string) => {
    if (loading) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "AIの応答に失敗しました。");
      }
      const data = (await res.json()) as ChatResponse;
      const reply = data.reply?.trim() || "返答を取得できませんでした。";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          results: data.results ?? null,
          showTopLink: Boolean(data.showTopLink),
        },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "AIの応答に失敗しました。";
      setError(message);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "うまく取得できませんでした。もう一度試してください。" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    await sendMessage(text);
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-5xl flex-col gap-6 px-4 pb-12 pt-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900">マコトGPT</h1>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
           開発中
          </span>
        </div>
        <p className="text-sm text-slate-600">
          スペックと年齢からAIがおすすめの店舗情報を絞り込みます。
        </p>
      </header>

      <section className="flex min-h-[520px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
        <div className="flex-1 overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`border-b border-slate-200/70 px-6 py-5 ${
                message.role === "user" ? "bg-white" : "bg-slate-50"
              }`}
            >
              <div className="mx-auto w-full max-w-3xl space-y-3 text-sm text-slate-700">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {message.role === "user" ? "あなた" : "AI"}
                </p>
                <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                {message.role === "assistant" && message.results && (
                  <div className="space-y-3 pt-2">
                    {message.results.picks.length > 0 ? (
                      <div className="grid gap-6 sm:grid-cols-2">
                        {message.results.picks.map((store) => (
                          <StoreCard key={`pick-${store.id}`} store={store} className="overflow-hidden" />
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">該当する店舗がありません。</div>
                    )}
                  </div>
                )}
                {message.role === "assistant" && message.showTopLink && (
                  <a
                    href="/"
                    className="text-xs font-semibold text-slate-600 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900"
                  >
                    こちらからすべてのユーザーはすべての店舗情報・アンケートのデータを検索できます。
                  </a>
                )}
              </div>
            </div>
          ))}
          {(loading || initialThinking) && (
            <div className="border-b border-slate-200/70 bg-slate-50 px-6 py-5">
              <div className="mx-auto w-full max-w-3xl space-y-3 text-sm text-slate-700">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">AI</p>
                <div className="text-xs text-slate-500">...</div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white px-6 py-4">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Makoto AIに相談"
              className="flex-1 rounded-2xl"
              disabled={loading}
            />
            <Button
              type="submit"
              variant="secondary"
              className="shadow-sm shadow-pink-200 rounded-2xl"
              disabled={loading}
            >
              送信
            </Button>
          </div>
          {error && <p className="mx-auto mt-2 w-full max-w-3xl text-xs text-rose-500">{error}</p>}
        </form>
      </section>
    </main>
  );
}
