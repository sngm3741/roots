import { useEffect, useMemo, useRef, useState } from "react";
import { Col } from "~/components/atoms/Col";
import { Grid12 } from "~/components/atoms/Grid12";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

type ChatbotCardProps = {
  userId: string;
};

export function ChatbotCard({ userId }: ChatbotCardProps) {
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
        body: JSON.stringify({ message: text, userId }),
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
    <Grid12 gap="1" className="justify-items-start">
      <Col span={12}>
        <Grid12 gap="1" className="items-center">
          <Col span={1}>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lilink-muted" />
          </Col>
          <Col span={1}>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lilink-muted [animation-delay:120ms]" />
          </Col>
          <Col span={1}>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lilink-muted [animation-delay:240ms]" />
          </Col>
        </Grid12>
      </Col>
    </Grid12>
  );

  return (
    <Grid12 gap="4">
      {messages.length > 0 ? (
        <Col span={12}>
          <Grid12
            gap="4"
            className="lilink-glass max-h-72 overflow-y-auto px-4 py-4"
          >
            {messages.map((message) => (
              <Col
                key={message.id}
                span={12}
                className={
                  message.role === "user"
                    ? "justify-items-end"
                    : "justify-items-start"
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
              </Col>
            ))}
            {isLoading ? (
              <Col span={12}>
                <LoadingIndicator />
              </Col>
            ) : null}
            <Col span={12}>
              <div ref={endOfMessagesRef} />
            </Col>
          </Grid12>
        </Col>
      ) : null}
      <Col span={12}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
        >
          <Grid12
            gap="3"
            className="lilink-glass items-center rounded-full px-4 py-3"
          >
            <Col span={10}>
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="今月のイベントは？"
                className="w-full bg-transparent text-base text-lilink-ink outline-none placeholder:text-lilink-muted"
              />
            </Col>
            <Col span={2} className="justify-items-end">
              <button
                type="submit"
                disabled={isSendDisabled}
                className="grid h-10 w-10 place-items-center rounded-full border border-lilink-border bg-gray-300 text-lilink-ink transition hover:border-lilink-accent hover:text-lilink-accent disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="送信"
              >
                ⬆
              </button>
            </Col>
          </Grid12>
        </form>
      </Col>
    </Grid12>
  );
}
