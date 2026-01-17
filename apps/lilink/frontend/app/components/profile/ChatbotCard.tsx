import { useEffect, useMemo, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function ChatbotCard() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSendDisabled = useMemo(
    () => input.trim().length === 0 || isLoading || isTyping,
    [input, isLoading, isTyping],
  );

  const handleSend = async () => {
    const text = input.trim();
    if (!text) {
      return;
    }

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
      setIsTyping(false);
    }

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = (await response.json()) as { reply?: string };
      const reply =
        response.ok && data.reply
          ? data.reply
          : "うまく返せなかったよ。";

      const assistantId = createId();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);
      setIsTyping(true);

      let index = 0;
      const baseDelayMs = 56;
      const pausePunctuationMs = 220;
      const step = () => {
        if (index >= reply.length) {
          typingTimerRef.current = null;
          setIsTyping(false);
          return;
        }

        index += 1;
        const nextChar = reply.charAt(index - 1);
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantId
              ? { ...message, content: reply.slice(0, index) }
              : message,
          ),
        );

        const extraDelay =
          nextChar === "。" || nextChar === "、" ? pausePunctuationMs : 0;
        typingTimerRef.current = setTimeout(step, baseDelayMs + extraDelay);
      };

      typingTimerRef.current = setTimeout(step, baseDelayMs);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          content: "応答に失敗しました。",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isTyping]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  const LoadingIndicator = () => (
    <div className="grid justify-items-start">
      <div className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lilink-muted" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lilink-muted [animation-delay:120ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lilink-muted [animation-delay:240ms]" />
      </div>
    </div>
  );

  return (
    <section className="grid grid-cols-12 gap-4">
      {messages.length > 0 ? (
        <div className="col-span-12 lilink-glass grid max-h-72 gap-4 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <div
              key={message.id}
              className={
                message.role === "user"
                  ? "grid justify-items-end"
                  : "grid justify-items-start"
              }
            >
              <div
                className={
                  message.role === "user"
                    ? "max-w-[85%] rounded-full bg-neutral-600 px-3 py-1.5 text-xs text-white shadow-[0_8px_20px_rgba(31,42,51,0.18)]"
                    : "max-w-[85%] whitespace-pre-line text-sm text-lilink-ink"
                }
              >
                {message.content}
              </div>
          </div>
        ))}
        {isLoading ? <LoadingIndicator /> : null}
        <div ref={endOfMessagesRef} />
      </div>
      ) : null}
      <form
        className="col-span-12"
        onSubmit={(event) => {
          event.preventDefault();
          handleSend();
        }}
      >
        <div className="lilink-glass grid grid-cols-[1fr_auto] items-center gap-3 rounded-full px-4 py-3">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="メッセージを入力"
            className="w-full bg-transparent text-base text-lilink-ink outline-none placeholder:text-lilink-muted"
          />
          <button
            type="submit"
            disabled={isSendDisabled}
            className="grid h-10 w-10 place-items-center rounded-full border border-lilink-border bg-gray-300 text-lilink-ink transition hover:border-lilink-accent hover:text-lilink-accent disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="送信"
          >
            ⬆
          </button>
        </div>
      </form>
    </section>
  );
}
