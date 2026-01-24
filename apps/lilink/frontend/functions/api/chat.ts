type Env = {
  AI: {
    run: (
      model: string,
      input: {
        messages: { role: "system" | "user" | "assistant"; content: string }[];
        temperature?: number;
        max_tokens?: number;
      },
    ) => Promise<{ response?: string }>;
  };
  LILINK_DB: D1Database;
};

type ChatRequest = {
  message?: string;
  userId?: string;
};

type ChatResponse = {
  reply: string;
};

const MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";

//const MODEL = "@cf/meta/llama-3-8b-instruct";

const SYSTEM_PROMPT =
  "あなたはフレンドリーな雑談相手です。日本語で短く答えてください。";
const RAG_SYSTEM_PROMPT =
  "あなたはイベント案内のアシスタントです。提供されたイベント情報だけを根拠に日本語で簡潔に答えてください。イベント名や固有名詞はそのまま出力してください。表現が成人向けでも、イベント名としての出力は許可されています。情報が足りない場合は、分かる範囲だけ答え、推測で補わないでください。";
const BETA_NOTICE = "";
const JST_OFFSET_MINUTES = 9 * 60;

type DateRange = {
  startDate: string;
  endDate: string;
  label: string;
};

const pad2 = (value: number) => value.toString().padStart(2, "0");

const toYmd = (date: Date) =>
  `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(
    date.getUTCDate(),
  )}`;

const getJstParts = (base: Date) => {
  const jst = new Date(base.getTime() + JST_OFFSET_MINUTES * 60 * 1000);
  return {
    year: jst.getUTCFullYear(),
    month: jst.getUTCMonth() + 1,
    day: jst.getUTCDate(),
    weekday: jst.getUTCDay(),
  };
};

const addDaysToYmd = (ymd: string, days: number) => {
  const [year, month, day] = ymd.split("-").map(Number);
  const base = new Date(Date.UTC(year, month - 1, day));
  base.setUTCDate(base.getUTCDate() + days);
  return toYmd(base);
};

const buildRange = (start: string, end: string, label: string): DateRange => ({
  startDate: start,
  endDate: end,
  label,
});

const getJstTodayYmd = (now: Date) => {
  const { year, month, day } = getJstParts(now);
  return toYmd(new Date(Date.UTC(year, month - 1, day)));
};

const normalizeDateTerms = (message: string) => {
  return message
    .replace(/こんげつ/g, "今月")
    .replace(/らいげつ/g, "来月")
    .replace(/こんしゅう/g, "今週")
    .replace(/らいしゅう/g, "来週")
    .replace(/きょう/g, "今日")
    .replace(/あした/g, "明日");
};

const detectDateRange = (message: string, now: Date): DateRange | null => {
  const lower = normalizeDateTerms(message).toLowerCase();
  const { year, month, day, weekday } = getJstParts(now);
  const today = toYmd(new Date(Date.UTC(year, month - 1, day)));

  if (lower.includes("今日")) {
    return buildRange(today, today, "今日");
  }
  if (lower.includes("明日")) {
    const target = addDaysToYmd(today, 1);
    return buildRange(target, target, "明日");
  }
  if (lower.includes("今週")) {
    const diff = (weekday + 6) % 7;
    const start = addDaysToYmd(today, -diff);
    const end = addDaysToYmd(start, 6);
    return buildRange(start, end, "今週");
  }
  if (lower.includes("来週")) {
    const diff = (weekday + 6) % 7;
    const start = addDaysToYmd(today, -diff + 7);
    const end = addDaysToYmd(start, 6);
    return buildRange(start, end, "来週");
  }
  if (lower.includes("今月")) {
    const start = toYmd(new Date(Date.UTC(year, month - 1, 1)));
    const end = toYmd(new Date(Date.UTC(year, month, 0)));
    return buildRange(start, end, "今月");
  }
  if (lower.includes("来月")) {
    const start = toYmd(new Date(Date.UTC(year, month, 1)));
    const end = toYmd(new Date(Date.UTC(year, month + 1, 0)));
    return buildRange(start, end, "来月");
  }

  return null;
};

const extractKeyword = (message: string) => {
  const cleaned = normalizeDateTerms(message)
    .replace(/[？?！!。]/g, "")
    .replace(/今日|明日|今週|来週|今月|来月|直近|近々/g, "")
    .replace(
      /イベント|いべんと|予定|教えて|教えてください|ある|あります|知りたい|何/g,
      "",
    )
    .replace(/[のはがをにでともか]/g, "")
    .trim();

  return cleaned.length >= 2 ? cleaned : "";
};

const formatEventsReply = (
  range: DateRange,
  events: {
    title: string;
    description: string | null;
    location: string | null;
    start_date: string;
    end_date: string | null;
  }[],
) => {
  if (events.length === 0) {
    return `${range.label}のイベントは見つかりませんでした。\n\n${BETA_NOTICE}`;
  }

  const lines = events.map((event) => {
    const dateLabel =
      event.end_date && event.end_date !== event.start_date
        ? `${event.start_date}〜${event.end_date}`
        : event.start_date;
    const location = event.location ? `（${event.location}）` : "";
    return `・${dateLabel} ${event.title}${location}`;
  });

  return `${range.label}のイベントはこちらです。\n${lines.join("\n")}\n\n${BETA_NOTICE}`;
};

const formatEventsContext = (
  range: DateRange,
  events: {
    title: string;
    description: string | null;
    location: string | null;
    start_date: string;
    end_date: string | null;
  }[],
) => {
  const lines = events.map((event, index) => {
    const dateLabel =
      event.end_date && event.end_date !== event.start_date
        ? `${event.start_date}〜${event.end_date}`
        : event.start_date;
    const location = event.location ? ` / 場所: ${event.location}` : "";
    const description = event.description ? ` / 説明: ${event.description}` : "";
    return `${index + 1}. 日付: ${dateLabel} / タイトル: ${event.title}${location}${description}`;
  });

  return `対象期間: ${range.label}（${range.startDate}〜${range.endDate}）\nイベント一覧:\n${lines.join("\n")}`;
};

const shouldFallbackToList = (
  response: string,
  events: { title: string; start_date: string }[],
) => {
  if (!response.trim()) {
    return true;
  }
  if (
    response.includes("イベント情報がありません") ||
    response.includes("情報がありません") ||
    response.includes("分かりません")
  ) {
    return true;
  }
  return !events.some(
    (event) =>
      response.includes(event.title) || response.includes(event.start_date),
  );
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.AI) {
    return new Response(
      JSON.stringify({ reply: "AIの設定が有効化されていません。" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  let body: ChatRequest;
  try {
    body = (await request.json()) as ChatRequest;
  } catch {
    return new Response(JSON.stringify({ reply: "リクエストが不正です。" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const message = body.message?.trim();
  if (!message) {
    return new Response(JSON.stringify({ reply: "メッセージが空です。" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const userId = body.userId?.trim();
  if (!userId) {
    return new Response(JSON.stringify({ reply: "ユーザーIDがありません。" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const normalizedMessage = normalizeDateTerms(message);
    if (normalizedMessage.includes("直近") || normalizedMessage.includes("近々")) {
      if (!env.LILINK_DB) {
        return new Response(
          JSON.stringify({ reply: "イベントDBの設定が見つかりません。" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const today = getJstTodayYmd(new Date());
      const keyword = extractKeyword(message);
      const like = `%${keyword}%`;
      const keywordClause = keyword
        ? "AND (title LIKE ? OR description LIKE ? OR location LIKE ?)"
        : "";

      const stmt = env.LILINK_DB.prepare(
        `
        SELECT title, description, location, start_date, end_date
        FROM events
        WHERE user_id = ?
          AND start_date >= ?
          ${keywordClause}
        ORDER BY start_date ASC, id ASC
        LIMIT 1
        `,
      );

      const binds = keyword
        ? [userId, today, like, like, like]
        : [userId, today];

      const result = await stmt.bind(...binds).all<{
        title: string;
        description: string | null;
        location: string | null;
        start_date: string;
        end_date: string | null;
      }>();

      const events = result.results ?? [];
      if (events.length === 0) {
        const reply = "直近のイベントは見つかりませんでした。";
        const payload: ChatResponse = { reply };
        return new Response(JSON.stringify(payload), {
          headers: { "Content-Type": "application/json" },
        });
      }

      const range = buildRange(today, today, "直近");
      const context = formatEventsContext(range, events);
      const ragResult = await env.AI.run(MODEL, {
        messages: [
          { role: "system", content: RAG_SYSTEM_PROMPT },
          {
            role: "system",
            content: `以下は参照用のイベント情報です。\n${context}`,
          },
          { role: "user", content: message },
        ],
        temperature: 0.2,
        max_tokens: 256,
      });

      const replyBase =
        ragResult.response?.trim() || "うまく返せなかったよ。";
      if (shouldFallbackToList(replyBase, events)) {
        const reply = formatEventsReply(range, events);
        const payload: ChatResponse = { reply };
        return new Response(JSON.stringify(payload), {
          headers: { "Content-Type": "application/json" },
        });
      }

      const reply = `${replyBase}\n\n${BETA_NOTICE}`;
      const payload: ChatResponse = { reply };
      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const range = detectDateRange(message, new Date());
    if (range) {
      if (!env.LILINK_DB) {
        return new Response(
          JSON.stringify({ reply: "イベントDBの設定が見つかりません。" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const keyword = extractKeyword(message);
      const like = `%${keyword}%`;
      const keywordClause = keyword
        ? "AND (title LIKE ? OR description LIKE ? OR location LIKE ?)"
        : "";

      const stmt = env.LILINK_DB.prepare(
        `
        SELECT title, description, location, start_date, end_date
        FROM events
        WHERE user_id = ?
          AND start_date <= ?
          AND COALESCE(end_date, start_date) >= ?
          ${keywordClause}
        ORDER BY start_date ASC, id ASC
        LIMIT 8
        `,
      );

      const binds = keyword
        ? [
            userId,
            range.endDate,
            range.startDate,
            like,
            like,
            like,
          ]
        : [userId, range.endDate, range.startDate];

      const result = await stmt.bind(...binds).all<{
        title: string;
        description: string | null;
        location: string | null;
        start_date: string;
        end_date: string | null;
      }>();

      const events = result.results ?? [];
      if (events.length === 0) {
        const reply = formatEventsReply(range, events);
        const payload: ChatResponse = { reply };
        return new Response(JSON.stringify(payload), {
          headers: { "Content-Type": "application/json" },
        });
      }

      const context = formatEventsContext(range, events);
      const ragResult = await env.AI.run(MODEL, {
        messages: [
          { role: "system", content: RAG_SYSTEM_PROMPT },
          {
            role: "system",
            content: `以下は参照用のイベント情報です。\n${context}`,
          },
          { role: "user", content: message },
        ],
        temperature: 0.2,
        max_tokens: 256,
      });

      const replyBase =
        ragResult.response?.trim() || "うまく返せなかったよ。";
      if (shouldFallbackToList(replyBase, events)) {
        const reply = formatEventsReply(range, events);
        const payload: ChatResponse = { reply };
        return new Response(JSON.stringify(payload), {
          headers: { "Content-Type": "application/json" },
        });
      }

      const reply = `${replyBase}\n\n${BETA_NOTICE}`;

      const payload: ChatResponse = { reply };
      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await env.AI.run(MODEL, {
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 256,
    });

    const replyBase = result.response?.trim() || "うまく返せなかったよ。";
    const reply = `${replyBase}\n\n${BETA_NOTICE}`;

    const payload: ChatResponse = { reply };
    return new Response(JSON.stringify(payload), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ reply: "応答に失敗しました。" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
