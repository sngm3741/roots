import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Send, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { SurveyCard } from "../components/cards/survey-card";
import type { SurveySummary } from "../types/survey";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  results?: { picks: SurveySummary[] } | null;
  showTopLink?: boolean;
};

type ChatResponse = {
  reply: string;
  filters: { age: number; spec: number } | null;
  results: { picks: SurveySummary[] } | null;
  showTopLink?: boolean;
};

export default function RagPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialThinking, setInitialThinking] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([{ role: "assistant", content: "年齢と身長・体重を教えて？（スペもOK）" }]);
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

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || loading) return;
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    void sendMessage(text);
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top,#fef9ff,white_45%)] px-4 py-6 md:px-6 md:py-8">
      <section className="mx-auto flex h-[calc(100vh-8rem)] max-h-[780px] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_70px_-36px_rgba(15,23,42,0.45)]">
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-4 md:px-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white">
                <Sparkles size={16} />
              </span>
              <h1 className="text-base font-semibold text-slate-900 md:text-lg">マコトGPT</h1>
            </div>
            <p className="text-xs text-slate-500 md:text-sm">
              年齢とスペックに近いアンケートを提案します
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Online
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50/50 px-3 py-4 md:px-5">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="flex max-w-[94%] gap-2 md:max-w-[88%]">
                {message.role === "assistant" && (
                  <div className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    AI
                  </div>
                )}
                <div
                  className={`space-y-3 rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    message.role === "user"
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                {message.role === "assistant" && message.results && (
                  <div className="space-y-3 pt-2">
                    {message.results.picks.length > 0 ? (
                      <div className="grid gap-6 sm:grid-cols-2">
                        {message.results.picks.map((survey) => (
                          <SurveyCard
                            key={`pick-${survey.id}`}
                            survey={survey}
                            className="overflow-hidden"
                          />
                        ))}
                        <Link
                          to="/"
                          className="group flex min-h-40 flex-col justify-between rounded-2xl border border-dashed border-slate-300 bg-white p-4 transition hover:border-slate-500 hover:bg-slate-100"
                        >
                          <div className="text-xs font-semibold tracking-wide text-slate-500">
                            もっと探す
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                              全件検索はこちら
                            </p>
                            <p className="text-xs text-slate-500">
                              トップページで店舗・アンケートを条件検索できます。
                            </p>
                          </div>
                        </Link>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">該当するアンケートがありません。</div>
                    )}
                  </div>
                )}
                </div>
                {message.role === "user" && (
                  <div className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    YOU
                  </div>
                )}
              </div>
            </div>
          ))}
          {(loading || initialThinking) && (
            <div className="mb-4 flex justify-start">
              <div className="flex max-w-[88%] gap-2">
                <div className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  AI
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-3 md:p-4">
          <div className="mx-auto flex w-full max-w-3xl items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => handleInputChange(event.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="例: 24歳 / 身長160 体重50 / スペ110"
              rows={1}
              className="max-h-40 min-h-[44px] flex-1 resize-none rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
              disabled={loading}
            />
            <Button
              type="submit"
              className="h-11 w-11 rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
              disabled={loading || !input.trim()}
            >
              <Send size={16} />
              <span className="sr-only">送信</span>
            </Button>
          </div>
          {error && <p className="mx-auto mt-2 w-full max-w-3xl text-xs text-rose-500">{error}</p>}
        </form>
      </section>
    </main>
  );
}
