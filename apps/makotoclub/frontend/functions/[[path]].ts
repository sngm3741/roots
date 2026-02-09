// @ts-ignore build types are emitted JS only
import { createPagesFunctionHandler } from "@react-router/cloudflare";
import type { ServerBuild } from "react-router";
// @ts-ignore generated at build time
import * as buildModule from "../build/server/index.js";
import { createElement } from "react";
import satori from "satori";
import { Resvg, initWasm } from "@resvg/resvg-wasm";
// @ts-ignore resvgのwasmは型が無いので明示的に無視する
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";
import { handleCommentRoutes } from "./_api/comments";
import { handleLinkPreviewRoutes } from "./_api/link-preview";
import { handleMetricRoutes, recordAccessHit } from "./_api/metrics";
import { handleStoreRoutes } from "./_api/stores";
import { handleSurveyRoutes } from "./_api/surveys";
import {
  AI_CHAT_RATE_LIMIT_MAX,
  AI_CHAT_RATE_LIMIT_WINDOW_SEC,
  MAX_UPLOAD_BYTES,
  UPLOAD_RATE_LIMIT_MAX,
  UPLOAD_RATE_LIMIT_WINDOW_SEC,
} from "./_shared/constants";
import { applyRateLimit } from "./_shared/db-helpers";
import { mapSurvey } from "./_shared/mappers";
import { parseJsonObject, parseNumberParam } from "./_shared/parsers";
import { detectImageContentType, extractClientIp } from "./_shared/security";
import type { Env } from "./_shared/types";

let resvgReady: Promise<void> | null = null;
const ensureResvg = () => {
  if (!resvgReady) {
    resvgReady = initWasm(resvgWasm);
  }
  return resvgReady;
};

let ogpFontDataPromise: Promise<ArrayBuffer> | null = null;
const loadOgFontData = (env: Env, origin: string) => {
  if (!ogpFontDataPromise) {
    const fontUrl = new URL("/fonts/NotoSansJP-Regular.ttf", origin);
    ogpFontDataPromise = (async () => {
      const res = env.ASSETS ? await env.ASSETS.fetch(fontUrl) : await fetch(fontUrl);
      if (!res.ok) {
        throw new Error("OGPフォントの取得に失敗しました。");
      }
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("text/html")) {
        throw new Error("OGPフォントの取得に失敗しました。");
      }
      return res.arrayBuffer();
    })().catch((error) => {
      ogpFontDataPromise = null;
      throw error;
    });
  }
  return ogpFontDataPromise;
};

const truncateText = (text: string, limit: number) => {
  if (text.length <= limit) return text;
  return text.slice(0, limit);
};

const buildStarFillPercent = (rating: number) => {
  const safe = Math.max(0, Math.min(5, rating));
  return `${(safe / 5) * 100}%`;
};

const buildOgpComment = (
  survey: {
    customer_comment?: string | null;
    staff_comment?: string | null;
    work_environment_comment?: string | null;
    etc_comment?: string | null;
  },
  limit: number,
  maxLines: number,
) => {
  const parts = [
    { label: "客層", text: survey.customer_comment },
    { label: "スタッフ対応", text: survey.staff_comment },
    { label: "環境", text: survey.work_environment_comment },
    { label: "その他", text: survey.etc_comment },
  ]
    .map((item) => {
      const body = (item.text ?? "").trim();
      if (!body) return "";
      return `【${item.label}】\n${body}`;
    })
    .filter((text) => text.length > 0);

  const combined = parts.join("\n\n");
  const trimmed = truncateText(combined || "コメントなし", limit);
  const lines = trimmed.split("\n");
  if (lines.length <= maxLines) return trimmed;
  const sliced = lines.slice(0, maxLines);
  const last = sliced[sliced.length - 1] ?? "";
  sliced[sliced.length - 1] = last.endsWith("...") ? last : `${last}...`;
  return sliced.join("\n");
};

const buildOgpMessage = (body: string, limit: number, maxLines: number) => {
  const base = (body ?? "").trim() || "コメントなし";
  const trimmed = truncateText(base, limit);
  const lines = trimmed.split("\n");
  if (lines.length <= maxLines) return trimmed;
  const sliced = lines.slice(0, maxLines);
  const last = sliced[sliced.length - 1] ?? "";
  sliced[sliced.length - 1] = last.endsWith("...") ? last : `${last}...`;
  return sliced.join("\n");
};

const extractRagInputs = (messages: { role?: string; content?: string }[]) => {
  let age: number | null = null;
  let height: number | null = null;
  let weight: number | null = null;
  let spec: number | null = null;
  let wantsList = false;

  for (const message of messages) {
    if (message.role !== "user") continue;
    const text = (message.content ?? "").trim();
    if (!text) continue;

    if (/(一覧|トップ|店舗一覧)/.test(text)) {
      wantsList = true;
    }

    const ageMatch = text.match(/(\d{1,2})\s*歳/);
    if (ageMatch) age = Number(ageMatch[1]);
    const ageLabelMatch = text.match(/年齢\s*[:=]?\s*(\d{1,2})/);
    if (ageLabelMatch) age = Number(ageLabelMatch[1]);

    const heightMatch = text.match(/身長\s*[:=]?\s*(\d{2,3})/);
    if (heightMatch) height = Number(heightMatch[1]);
    const heightUnitMatch = text.match(/(\d{2,3})\s*cm/);
    if (heightUnitMatch) {
      if (/身長/.test(text) || !height) height = Number(heightUnitMatch[1]);
    }

    const weightMatch = text.match(/体重\s*[:=]?\s*(\d{2,3})/);
    if (weightMatch) weight = Number(weightMatch[1]);
    const weightUnitMatch = text.match(/(\d{2,3})\s*kg/);
    if (weightUnitMatch) {
      if (/体重/.test(text) || !weight) weight = Number(weightUnitMatch[1]);
    }

    const specMatch = text.match(/(?:スペ|スペック)\s*[:=]?\s*(\d{2,3})/);
    if (specMatch) spec = Number(specMatch[1]);

    // 例: "25 160 87" のようなラベルなし入力にも対応する
    const plainNumbers = (text.match(/\d{1,3}/g) ?? []).map(Number);
    if (plainNumbers.length >= 3) {
      for (let i = 0; i <= plainNumbers.length - 3; i += 1) {
        const a = plainNumbers[i];
        const h = plainNumbers[i + 1];
        const w = plainNumbers[i + 2];
        const looksLikeProfile =
          a >= 16 && a <= 69 && h >= 130 && h <= 210 && w >= 30 && w <= 180;
        if (!looksLikeProfile) continue;
        if (age === null) age = a;
        if (height === null) height = h;
        if (weight === null) weight = w;
        break;
      }
    }
  }

  return { age, height, weight, spec, wantsList };
};

const parseAiChatJson = (raw: string) => {
  const tryParse = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      return typeof parsed === "object" && parsed !== null ? parsed : null;
    } catch {
      return null;
    }
  };

  const direct = tryParse(raw);
  if (direct) return direct as Record<string, unknown>;

  const block = raw.match(/\{[\s\S]*\}/);
  if (!block) return null;
  const extracted = tryParse(block[0]);
  if (!extracted) return null;
  return extracted as Record<string, unknown>;
};

const fetchRagCandidates = async (env: Env, age: number, spec: number) => {
  const ageScale = 5;
  const specScale = 5;
  const pickCount = 3;

  const totalRes = await env.DB.prepare(
    `SELECT COUNT(*) as c
     FROM surveys
     WHERE deleted_at IS NULL`,
  ).first();

  const rows = await env.DB.prepare(
    `SELECT
       s.*,
       (SELECT COUNT(*) FROM store_comments sc WHERE sc.store_id = s.store_id AND sc.deleted_at IS NULL) AS comment_count
     FROM surveys s
     WHERE s.deleted_at IS NULL
     ORDER BY
       ((s.age - ?) / ?) * ((s.age - ?) / ?) +
       ((s.spec_score - ?) / ?) * ((s.spec_score - ?) / ?) ASC
     LIMIT ?`,
  )
    .bind(
      age,
      ageScale,
      age,
      ageScale,
      spec,
      specScale,
      spec,
      specScale,
      pickCount,
    )
    .all();

  return {
    age,
    spec,
    ageScale,
    specScale,
    totalCandidates: totalRes?.c ?? 0,
    picks: (rows.results ?? []).map(mapSurvey),
  };
};

const writeAccessLog = async (request: Request, env: Env, status: number) => {
  if (!env.DB) return;
  const now = new Date().toISOString();
  const ip = extractClientIp(request);
  const userAgent = request.headers.get("user-agent");
  const path = new URL(request.url).pathname;
  const method = request.method;
  try {
    await env.DB.prepare(
      `INSERT INTO access_logs (id, ip, user_agent, path, method, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        crypto.randomUUID(),
        ip,
        userAgent ?? null,
        path,
        method,
        status,
        now,
      )
      .run();
  } catch (error) {
    console.error("アクセスログの保存に失敗しました", error);
  }
};

async function handleApi(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  const { pathname } = url;
  const bucket = env.makotoclub_assets;
  const respondWithLog = async (response: Response) => {
    await writeAccessLog(request, env, response.status || 200);
    return response;
  };

  // Allow Chrome devtools request to fail fast with 204 to avoid router error
  if (pathname === "/.well-known/appspecific/com.chrome.devtools.json") {
    return new Response(null, { status: 204 });
  }

  // GET /api/og/surveys/:id -> OGP画像生成
  if (pathname.startsWith("/api/og/surveys/") && request.method === "GET") {
    try {
      if (!env.DB) {
        return new Response("DBが設定されていません。", { status: 500 });
      }
      if (!bucket) {
        return new Response("R2が設定されていません。", { status: 500 });
      }
      const id = pathname.replace("/api/og/surveys/", "").trim();
      if (!id) {
        return new Response("アンケートIDが指定されていません。", { status: 400 });
      }

      const cacheKey = `ogp/surveys/${id}.png`;
      const cached = await bucket.get(cacheKey);
      if (cached) {
        const headers = new Headers();
        headers.set("Content-Type", cached.httpMetadata?.contentType ?? "image/png");
        headers.set("Cache-Control", "public, max-age=86400");
        return new Response(cached.body ?? cached, { headers });
      }

      const row = await env.DB.prepare(
        `SELECT store_name, store_branch, rating, customer_comment, staff_comment, work_environment_comment, etc_comment
         FROM surveys WHERE id = ? AND deleted_at IS NULL`,
      )
        .bind(id)
        .first();

      if (!row) {
        return new Response("アンケートが見つかりませんでした。", { status: 404 });
      }

      const storeName = row.store_name as string;
      const storeBranch = row.store_branch as string | null;
      const rating = Number(row.rating ?? 0);
      const starFill = buildStarFillPercent(rating);
      const commentText = buildOgpComment(row, 200, 9);
      const fontData = await loadOgFontData(env, new URL(request.url).origin);
      await ensureResvg();

      const svg = await satori(
        createElement(
          "div",
          {
            style: {
              width: "1200px",
              height: "630px",
              display: "flex",
              background: "#fdf2f8",
              padding: "32px",
              fontFamily: "Noto Sans JP",
            },
          },
          createElement(
            "div",
            {
              style: {
                width: "100%",
                height: "100%",
                background: "#ffffff",
                borderRadius: "28px",
                border: "2px solid #f9a8d4",
                padding: "40px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              },
            },
            createElement(
              "div",
              {
                style: {
                  fontSize: "24px",
                  color: "#db2777",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                },
              },
              "#匿名店舗アンケート",
            ),
            createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                },
              },
              createElement(
                "div",
                {
                  style: {
                    position: "relative",
                    display: "flex",
                    width: "340px",
                    height: "64px",
                  },
                },
                createElement(
                  "div",
                  {
                    style: {
                      position: "absolute",
                      top: 0,
                      left: 0,
                      fontSize: "56px",
                      color: "#fbcfe8",
                      letterSpacing: "0.08em",
                      lineHeight: 1,
                    },
                  },
                  "★★★★★",
                ),
                createElement(
                  "div",
                  {
                    style: {
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: starFill,
                      overflow: "hidden",
                      fontSize: "56px",
                      color: "#db2777",
                      letterSpacing: "0.08em",
                      lineHeight: 1,
                    },
                  },
                  "★★★★★",
                ),
              ),
              createElement(
                "div",
                {
                  style: {
                    fontSize: "52px",
                    fontWeight: 700,
                    color: "#db2777",
                  },
                },
                rating.toFixed(1),
              ),
            ),
            createElement(
              "div",
              {
                style: {
                  fontSize: "22px",
                  color: "#334155",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.5,
                },
              },
              commentText,
            ),
          ),
        ),
        {
          width: 1200,
          height: 630,
          fonts: [
            {
              name: "Noto Sans JP",
              data: fontData,
              weight: 400,
              style: "normal",
            },
          ],
        },
      );

      const resvg = new Resvg(svg);
      const pngData = resvg.render();
      const pngBuffer = pngData.asPng();
      const arrayBuffer = new ArrayBuffer(pngBuffer.length);
      new Uint8Array(arrayBuffer).set(pngBuffer);
      const pngBlob = new Blob([arrayBuffer], { type: "image/png" });

      await bucket.put(cacheKey, pngBlob, {
        httpMetadata: { contentType: "image/png" },
      });

      return new Response(pngBlob, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400",
        },
      });
    } catch (error) {
      console.error("OGP画像の生成に失敗しました", error);
      return new Response("OGP画像の生成に失敗しました。", { status: 500 });
    }
  }

  // GET /api/og/comments/:id -> OGP画像生成
  if (pathname.startsWith("/api/og/comments/") && request.method === "GET") {
    try {
      if (!env.DB) {
        return new Response("DBが設定されていません。", { status: 500 });
      }
      if (!bucket) {
        return new Response("R2が設定されていません。", { status: 500 });
      }
      const id = pathname.replace("/api/og/comments/", "").trim();
      if (!id) {
        return new Response("コメントIDが指定されていません。", { status: 400 });
      }

      const cacheKey = `ogp/comments/${id}.png`;
      const cached = await bucket.get(cacheKey);
      if (cached) {
        const headers = new Headers();
        headers.set("Content-Type", cached.httpMetadata?.contentType ?? "image/png");
        headers.set("Cache-Control", "public, max-age=86400");
        return new Response(cached.body ?? cached, { headers });
      }

      const row = await env.DB.prepare(
        `SELECT sc.body, s.name AS store_name, s.branch_name AS store_branch
           FROM store_comments sc
           JOIN stores s ON sc.store_id = s.id
          WHERE sc.id = ? AND sc.deleted_at IS NULL AND s.deleted_at IS NULL`,
      )
        .bind(id)
        .first();

      if (!row) {
        return new Response("コメントが見つかりませんでした。", { status: 404 });
      }

      const storeName = row.store_name as string;
      const storeBranch = row.store_branch as string | null;
      const commentText = buildOgpMessage(String(row.body ?? ""), 220, 8);
      const fontData = await loadOgFontData(env, new URL(request.url).origin);
      await ensureResvg();

      const svg = await satori(
        createElement(
          "div",
          {
            style: {
              width: "1200px",
              height: "630px",
              display: "flex",
              background: "#fdf2f8",
              padding: "32px",
              fontFamily: "Noto Sans JP",
            },
          },
          createElement(
            "div",
            {
              style: {
                width: "100%",
                height: "100%",
                background: "#ffffff",
                borderRadius: "28px",
                border: "2px solid #f9a8d4",
                padding: "40px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              },
            },
            createElement(
              "div",
              {
                style: {
                  fontSize: "24px",
                  color: "#db2777",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                },
              },
              "#みんなのコメント",
            ),
            createElement(
              "div",
              {
                style: {
                  fontSize: "22px",
                  color: "#475569",
                },
              },
              `${storeName}${storeBranch ? ` ${storeBranch}` : ""}`,
            ),
            createElement(
              "div",
              {
                style: {
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  color: "#334155",
                  fontSize: "30px",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                },
              },
              commentText,
            ),
          ),
        ),
        {
          width: 1200,
          height: 630,
          fonts: [
            {
              name: "Noto Sans JP",
              data: fontData,
              weight: 400,
              style: "normal",
            },
          ],
        },
      );

      const resvg = new Resvg(svg);
      const pngData = resvg.render();
      const pngBuffer = pngData.asPng();
      const arrayBuffer = new ArrayBuffer(pngBuffer.length);
      new Uint8Array(arrayBuffer).set(pngBuffer);
      const pngBlob = new Blob([arrayBuffer], { type: "image/png" });

      await bucket.put(cacheKey, pngBlob, {
        httpMetadata: { contentType: "image/png" },
      });

      return new Response(pngBlob, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400",
        },
      });
    } catch (error) {
      console.error("OGP画像の生成に失敗しました", error);
      return new Response("OGP画像の生成に失敗しました。", { status: 500 });
    }
  }

  // POST /api/uploads (multipart, single file)
  if (pathname === "/api/uploads" && request.method === "POST") {
    if (!bucket) {
      return await respondWithLog(new Response("R2 bucket not configured", { status: 500 }));
    }
    const uploadLimit = await applyRateLimit(
      env,
      request,
      "uploads",
      UPLOAD_RATE_LIMIT_MAX,
      UPLOAD_RATE_LIMIT_WINDOW_SEC,
    );
    if (!uploadLimit.allowed) {
      return await respondWithLog(
        new Response("アップロードの回数制限を超えました。しばらく待ってください。", {
          status: 429,
          headers: { "Retry-After": String(uploadLimit.retryAfter) },
        }),
      );
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return await respondWithLog(new Response("file is required", { status: 400 }));
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return await respondWithLog(new Response("file too large", { status: 413 }));
    }
    if (!file.type?.startsWith("image/")) {
      return await respondWithLog(new Response("画像ファイルのみアップロードできます。", { status: 400 }));
    }

    const arrayBuffer = await file.arrayBuffer();
    const actualContentType = detectImageContentType(new Uint8Array(arrayBuffer));
    if (!actualContentType) {
      return await respondWithLog(new Response("画像形式が不正です。", { status: 400 }));
    }

    const cleanName = file.name.replace(/[^\w.\-]/g, "_").slice(-80);
    const key = `${Date.now()}-${crypto.randomUUID()}-${cleanName}`;
    await bucket.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: actualContentType,
      },
    });

    return await respondWithLog(
      Response.json({
        key,
        url: `${url.origin}/api/uploads/${key}`,
        contentType: actualContentType,
        size: file.size,
      }),
    );
  }

  // GET /api/uploads/:key -> stream from R2
  if (pathname.startsWith("/api/uploads/") && request.method === "GET") {
    if (!bucket) return new Response("R2 bucket not configured", { status: 500 });
    const key = pathname.replace("/api/uploads/", "");
    const obj = await bucket.get(key);
    if (!obj) return new Response("Not Found", { status: 404 });
    const body = obj.body ?? obj;
    const headers = new Headers();
    const ctype = obj.httpMetadata?.contentType ?? "application/octet-stream";
    headers.set("Content-Type", ctype);
    return new Response(body, { headers });
  }

  const metricResponse = await handleMetricRoutes(request, url, pathname, env);
  if (metricResponse) return metricResponse;

  // GET /api/rag
  if (pathname === "/api/rag" && request.method === "GET") {
    const age = parseNumberParam(url.searchParams.get("age"));
    const spec = parseNumberParam(url.searchParams.get("spec"));
    if (age === null || spec === null) {
      return await respondWithLog(new Response("年齢とスペックを指定してください。", { status: 400 }));
    }
    const result = await fetchRagCandidates(env, age, spec);
    return Response.json(result);
  }

  // POST /api/ai/chat
  if (pathname === "/api/ai/chat" && request.method === "POST") {
    if (!env.AI) {
      return await respondWithLog(new Response("AIが設定されていません。", { status: 500 }));
    }
    const chatLimit = await applyRateLimit(
      env,
      request,
      "ai-chat",
      AI_CHAT_RATE_LIMIT_MAX,
      AI_CHAT_RATE_LIMIT_WINDOW_SEC,
    );
    if (!chatLimit.allowed) {
      return await respondWithLog(
        new Response("リクエストが多すぎます。しばらく待ってからお試しください。", {
          status: 429,
          headers: { "Retry-After": String(chatLimit.retryAfter) },
        }),
      );
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return await respondWithLog(new Response("JSONが不正です。", { status: 400 }));
    }

    const payloadObject = parseJsonObject(payload);
    const rawMessagesValue = payloadObject?.messages;
    const rawMessages = Array.isArray(rawMessagesValue) ? rawMessagesValue : [];
    if (rawMessages.length === 0) {
      return await respondWithLog(new Response("メッセージが空です。", { status: 400 }));
    }

    const messages = rawMessages
      .map((message) => {
        const msg = parseJsonObject(message);
        return {
          role: typeof msg?.role === "string" ? msg.role : "user",
          content: typeof msg?.content === "string" ? msg.content : "",
        };
      })
      .filter((message) => message.content.trim().length > 0)
      .slice(-12);
    const latestUserMessage =
      messages
        .slice()
        .reverse()
        .find((message: { role: string; content: string }) => message.role === "user")
        ?.content ?? "";
    const isCasualTalk =
      /やっほ|やっぴー|こんにちは|こんばんは|おはよう|はじめまして|元気|ええなに|何して|雑談|話そ|よろしく/.test(
        latestUserMessage,
      );

    const extracted = extractRagInputs(messages);
    const age = Number.isFinite(extracted.age ?? NaN) ? Number(extracted.age) : null;
    const height = Number.isFinite(extracted.height ?? NaN) ? Number(extracted.height) : null;
    const weight = Number.isFinite(extracted.weight ?? NaN) ? Number(extracted.weight) : null;
    const specDirect = Number.isFinite(extracted.spec ?? NaN) ? Number(extracted.spec) : null;
    const computedSpec =
      specDirect ?? (height !== null && weight !== null ? height - weight : null);

    const missing: string[] = [];
    if (age === null) missing.push("年齢");
    if (computedSpec === null) {
      if (height === null) missing.push("身長");
      if (weight === null) missing.push("体重");
    }

    let result: Awaited<ReturnType<typeof fetchRagCandidates>> | null = null;
    if (age !== null && computedSpec !== null) {
      result = await fetchRagCandidates(env, age, computedSpec);
    }

    const model = env.AI_MODEL ?? "@cf/meta/llama-3.1-8b-instruct";
    const candidateSummary = (result?.picks ?? [])
      .slice(0, 3)
      .map((pick: ReturnType<typeof mapSurvey>, index: number) => {
        const store = pick.storeBranch ? `${pick.storeName} ${pick.storeBranch}` : pick.storeName;
        return `${index + 1}. ${store} / 年齢${pick.age} / スペ${pick.specScore} / 評価${pick.rating}`;
      })
      .join("\n");
    const ragContext = [
      `抽出値: age=${age ?? "null"}, height=${height ?? "null"}, weight=${weight ?? "null"}, spec=${computedSpec ?? "null"}`,
      `不足項目: ${missing.length ? missing.join("・") : "なし"}`,
      `候補件数(返却): ${result?.picks?.length ?? 0}`,
      extracted.wantsList ? "一覧希望: あり" : "一覧希望: なし",
      `直近ユーザー発話: ${latestUserMessage || "(なし)"}`,
      isCasualTalk ? "会話モード: カジュアル雑談" : "会話モード: 通常",
      candidateSummary ? `候補サマリー:\n${candidateSummary}` : "候補サマリー: なし",
    ].join("\n");
    const systemPrompt = [
      "あなたはMakotoClubの相談AIです。自然で短い日本語で返答してください。",
      "会話の目的はアンケート候補の提示のみです。健康・運動・体型改善などの助言は禁止です。",
      "以下のJSONだけを返してください。余計な文字を含めないこと。",
      '{"reply":"string","followUpQuestion":"string","showTopLink":boolean}',
      "replyは1〜3文、followUpQuestionは必要な場合のみ短く、不要なら空文字。",
      "不足項目がある場合、まずユーザーの発話にワンクッションで返し、その後やわらかく不足項目を案内する。",
      "挨拶や軽い雑談には、その内容に短く反応してから案内に繋げる。",
      "候補がある場合は候補が見つかったことを自然に伝える。",
      "候補が0件の場合は条件変更を促す。",
      "一覧希望があり候補がある場合はshowTopLink=true、それ以外はfalse。",
      `\n判断材料:\n${ragContext}`,
    ].join("\n");

    let reply = "";
    let followUpQuestion = "";
    let aiShowTopLink = false;
    try {
      const aiResponse = await env.AI.run(model, {
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      });
      if (typeof aiResponse?.response === "string") {
        const parsed = parseAiChatJson(aiResponse.response.trim());
        if (parsed) {
          if (typeof parsed.reply === "string") {
            reply = parsed.reply.trim();
          }
          if (typeof parsed.followUpQuestion === "string") {
            followUpQuestion = parsed.followUpQuestion.trim();
          }
          if (typeof parsed.showTopLink === "boolean") {
            aiShowTopLink = parsed.showTopLink;
          }
        } else {
          reply = aiResponse.response.trim();
        }
      }
    } catch (error) {
      console.error("AI応答の取得に失敗しました", error);
    }

    if (missing.length > 0 && !reply) {
      const missingText = missing.join("と");
      reply = isCasualTalk
        ? `いいね、その感じ。参考になりそうなアンケートを選びたいから、${missingText}を教えてくれる？`
        : `ありがとう。参考になりそうなアンケートを選ぶために、${missingText}を教えてください。`;
    } else if (result && !reply) {
      if (result.picks.length > 0) {
        reply = `年齢${age}歳 スペ${computedSpec}に近いアンケートはこちらです。`;
      } else {
        reply = `年齢${age}歳 スペ${computedSpec}の条件では該当アンケートがありませんでした。条件を変えて探してみてください。`;
      }
    } else if (!reply) {
      reply = "年齢とスペックを教えてください。";
    }

    if (/(健康|運動|目標|体型|ダイエット|トレーニング)/.test(reply)) {
      reply = missing.length > 0 ? `${missing.join("と")}を教えてください。` : "候補をお出しします。";
    }
    if (missing.length > 0 && /^(年齢|身長|体重)(と|、|が)/.test(reply)) {
      const missingText = missing.join("と");
      reply = isCasualTalk
        ? `もちろん。まずは${missingText}を教えてくれたら、合いそうなアンケートを選べるよ。`
        : `参考になりそうなアンケートを選ぶために、${missingText}を教えてください。`;
    }
    // 値が揃って候補も返せる状態なのに再入力を要求しないように補正する
    if (
      missing.length === 0 &&
      result &&
      /(教えて|入力|不足|分かりません)/.test(reply) &&
      /(年齢|身長|体重|スペ)/.test(reply)
    ) {
      if (result.picks.length > 0) {
        reply = `ありがとう。年齢${age}歳 スペ${computedSpec}に近いアンケートを選びました。`;
      } else {
        reply = `年齢${age}歳 スペ${computedSpec}の条件では該当アンケートがありませんでした。条件を変えて探してみてください。`;
      }
    }
    // 必要値が揃った後は、返答フォーマットを固定してカード表示と整合させる
    if (missing.length === 0 && result) {
      const specLabel =
        specDirect !== null
          ? `${specDirect}`
          : `${height ?? "-"}cm - ${weight ?? "-"}kg（= ${computedSpec ?? "-"}）`;
      if (result.picks.length > 0) {
        reply = `${age}歳 スペ${specLabel} の方が参考になるアンケートはこちらです。`;
      } else {
        reply = `${age}歳 スペ${specLabel} の条件では該当アンケートがありませんでした。`;
      }
    }

    const shouldShowTopLink =
      aiShowTopLink || Boolean(result && result.picks.length > 0 && extracted.wantsList);

    return Response.json({
      reply,
      filters: age !== null && computedSpec !== null ? { age, spec: computedSpec } : null,
      results: result ? { picks: result.picks } : null,
      followUpQuestion,
      showTopLink: shouldShowTopLink,
    });
  }

  const commentResponse = await handleCommentRoutes(request, url, pathname, env);
  if (commentResponse) return commentResponse;

  const surveyResponse = await handleSurveyRoutes(request, url, pathname, env, respondWithLog);
  if (surveyResponse) return surveyResponse;

  const storeResponse = await handleStoreRoutes(request, url, pathname, env);
  if (storeResponse) return storeResponse;

  const linkPreviewResponse = await handleLinkPreviewRoutes(request, url, pathname, env);
  if (linkPreviewResponse) return linkPreviewResponse;

  return null;
}

export const onRequest = async (context: any) => {
  const apiResponse = await handleApi(context.request, context.env as Env);
  if (apiResponse) return apiResponse;

  const pageResponse = await createPagesFunctionHandler({
    build: buildModule as ServerBuild,
    getLoadContext({ context: ctx }) {
      return {
        cloudflare: ctx.cloudflare,
      };
    },
  })(context);
  await recordAccessHit(context.request, pageResponse, context.env as Env);
  return pageResponse;
};
