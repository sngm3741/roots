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
};

type ChatRequest = {
  message?: string;
};

type ChatResponse = {
  reply: string;
};

const MODEL = "@cf/meta/llama-3-8b-instruct";

const SYSTEM_PROMPT =
  "あなたはフレンドリーな雑談相手です。日本語で短く答えてください。";
const BETA_NOTICE = "（※この機能はベータ版です。ただいま開発中！🤖）";

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

  try {
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
