#!/usr/bin/env node

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const DEFAULT_INPUT =
  "/Users/sngm3741/Workspace/roots/apps/makotoclub/frontend/exports/d1_remote_snapshot_20260209_131900/url_enrichment/stores_url_worklist_unresolved.json";

const DEFAULT_OUTPUT =
  "/Users/sngm3741/Workspace/roots/apps/makotoclub/frontend/exports/d1_remote_snapshot_20260209_131900/url_enrichment/stores_url_candidates_auto_cityheaven.json";

const DEFAULT_MERGED_OUTPUT =
  "/Users/sngm3741/Workspace/roots/apps/makotoclub/frontend/exports/d1_remote_snapshot_20260209_131900/url_enrichment/stores_url_worklist_with_candidates_auto_cityheaven.json";

const DEFAULT_BASE_WORKLIST =
  "/Users/sngm3741/Workspace/roots/apps/makotoclub/frontend/exports/d1_remote_snapshot_20260209_131900/url_enrichment/stores_url_worklist.json";

const WAIT_MS = 700;
const CONCURRENCY = 1;
const execFileAsync = promisify(execFile);
const DEBUG_VERBOSE = process.env.URL_ENRICH_DEBUG_VERBOSE === "1";
const YAHOO_RETRY_MAX = 4;
const YAHOO_RETRY_WAIT_MS = 3000;

const sleep = (ms) => new Promise((resolveDelay) => setTimeout(resolveDelay, ms));

const isYahooBlockedPage = (html) =>
  html.includes("ご覧になろうとしているページは現在表示できません") ||
  html.includes("このページにアクセスできません");

const fetchHtmlWithCurl = async (url, options = {}) => {
  const maxRetry = options.maxRetry ?? 1;
  let lastHtml = "";
  let blocked = false;

  for (let attempt = 1; attempt <= maxRetry; attempt += 1) {
    const { stdout } = await execFileAsync("curl", ["-sL", url], {
      maxBuffer: 20 * 1024 * 1024,
    });
    lastHtml = stdout;
    blocked = isYahooBlockedPage(stdout);
    if (!blocked) {
      return { html: stdout, blocked: false, attempts: attempt };
    }
    if (attempt < maxRetry) {
      await sleep(YAHOO_RETRY_WAIT_MS * attempt);
    }
  }

  return { html: lastHtml, blocked, attempts: maxRetry };
};

const decodeHtml = (value) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const stripTags = (value) => decodeHtml(value.replace(/<[^>]+>/g, "").trim());

const normalizeUrl = (value) => {
  if (!value) return null;
  try {
    const url = new URL(value);
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
};

const normalizeCityheavenUrl = (value) => {
  const normalized = normalizeUrl(value);
  if (!normalized) return null;

  try {
    const parsed = new URL(normalized);
    const host = parsed.hostname.toLowerCase();
    if (!host.includes("cityheaven.net")) return null;

    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length < 4) return normalized;

    const deepTokens = ["girlid-", "gr_uid-", "A6Girl", "A5Girl", "A6", "A5"];
    const deepIndex = segments.findIndex((segment) =>
      deepTokens.some((token) => segment.includes(token))
    );

    if (deepIndex < 0) return normalized;
    const shopSegments = segments.slice(0, deepIndex);
    if (shopSegments.length < 4) return normalized;

    parsed.pathname = `/${shopSegments.join("/")}/`;
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return normalized;
  }
};

const normalizeTextForMatch = (value) =>
  (value || "")
    .toLowerCase()
    .replace(/[！!？?\s　・\-ー＿_（）()【】\[\]「」『』]/g, "");

const OFFICIAL_KEYWORDS = ["公式", "オフィシャル", "official", "ホームページ", "hp"];

const BLOCKED_HOST_PATTERNS = [
  "cityheaven.net",
  "girlsheaven-job.net",
  "mensheaven.jp",
  "bakusai.com",
  "x.com",
  "twitter.com",
  "youtube.com",
  "instagram.com",
  "tiktok.com",
  "hoteljoho.com",
  "link-heaven.net",
  "fuzoku.jp",
  "wikipedia.org",
];

const buildSearchQueries = (row) => {
  const parts = {
    name: typeof row.name === "string" ? row.name.trim() : "",
    branchName: typeof row.branchName === "string" ? row.branchName.trim() : "",
    prefecture: typeof row.prefecture === "string" ? row.prefecture.trim() : "",
    industry: typeof row.industry === "string" ? row.industry.trim() : "",
  };
  const candidates = [
    [parts.name, parts.branchName, parts.prefecture, parts.industry, "公式サイト"],
    [parts.name, parts.branchName, parts.prefecture, "公式サイト"],
    [parts.name, parts.prefecture, "公式サイト"],
  ];
  const unique = [];
  const seen = new Set();
  for (const tokens of candidates) {
    const query = tokens.filter(Boolean).join(" ").trim();
    if (!query || seen.has(query)) continue;
    seen.add(query);
    unique.push(query);
  }
  return unique;
};

const buildYahooUrl = (query) =>
  `https://search.yahoo.co.jp/search?p=${encodeURIComponent(query)}&ei=UTF-8&x=wrt`;

const parseYahooResults = (html) => {
  const sectionMatch = html.match(/<div id="web">[\s\S]*?<ol>([\s\S]*?)<\/ol>/i);
  if (!sectionMatch?.[1]) return [];
  const listHtml = sectionMatch[1];
  const results = [];
  const pattern =
    /<li><a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>(?:<div>([\s\S]*?)<\/div>)?(?:<em>([\s\S]*?)<\/em>)?<\/li>/gi;
  let matched;
  while ((matched = pattern.exec(listHtml)) !== null) {
    const href = decodeHtml(matched[1] ?? "");
    const title = stripTags(matched[2] ?? "");
    const snippet = stripTags(matched[3] ?? "");
    const cite = stripTags(matched[4] ?? "");
    if (!href) continue;
    results.push({ href, title, snippet, cite });
  }
  return results;
};

const isBlockedHost = (host) =>
  BLOCKED_HOST_PATTERNS.some((pattern) => host.includes(pattern));

const pickExternalOfficialFromYahooResults = (results, row) => {
  const nameNorm = normalizeTextForMatch(row.name);
  const branchNorm = normalizeTextForMatch(row.branchName);
  const prefNorm = normalizeTextForMatch(row.prefecture);

  const scored = [];
  for (const result of results) {
    const normalized = normalizeUrl(result.href);
    if (!normalized) continue;

    let host;
    try {
      host = new URL(normalized).hostname.toLowerCase();
    } catch {
      continue;
    }
    if (isBlockedHost(host)) continue;

    const titleNorm = normalizeTextForMatch(result.title);
    const snippetNorm = normalizeTextForMatch(result.snippet);
    const mergedNorm = `${titleNorm} ${snippetNorm}`;

    let score = 0;
    if (nameNorm && mergedNorm.includes(nameNorm)) score += 55;
    if (branchNorm && mergedNorm.includes(branchNorm)) score += 20;
    if (prefNorm && mergedNorm.includes(prefNorm)) score += 8;
    if (OFFICIAL_KEYWORDS.some((kw) => mergedNorm.includes(kw))) score += 22;

    // 一般的な店舗公式ドメインらしさの補正
    if (/\.(com|net|jp)$/i.test(host)) score += 5;
    if (host.startsWith("www.")) score += 2;

    scored.push({
      href: normalized,
      host,
      title: result.title,
      snippet: result.snippet,
      score,
    });
  }

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  if (!best || best.score < 55) return null;
  return best;
};

const isLikelyExternalOfficial = (urlText) => {
  const normalized = normalizeUrl(urlText);
  if (!normalized) return false;
  try {
    const host = new URL(normalized).hostname.toLowerCase();
    const deniedHosts = [
      "cityheaven.net",
      "girlsheaven-job.net",
      "mensheaven.jp",
      "hoteljoho.com",
      "link-heaven.net",
    ];
    return !deniedHosts.some((denied) => host.includes(denied));
  } catch {
    return false;
  }
};

const extractOfficialUrlFromCityheaven = (html) => {
  const patterns = [
    /オフィシャルサイト(?:（PC）|\(PC\))?[\s\S]{0,1600}?href="([^"]+)"/i,
    /itemprop="sameAs"[\s\S]{0,400}?href="([^"]+)"/i,
    /map_shoplink_list"[^>]*href="([^"]+)"/i,
  ];

  for (const pattern of patterns) {
    const matched = html.match(pattern);
    if (!matched?.[1]) continue;

    const decoded = decodeHtml(matched[1].trim());
    const candidate = decoded.startsWith("//") ? `https:${decoded}` : decoded;
    const normalized = normalizeUrl(candidate);
    if (normalized && isLikelyExternalOfficial(normalized)) {
      return normalized;
    }
  }

  return null;
};

const isCityheavenUrl = (urlText) => {
  try {
    const host = new URL(urlText).hostname.toLowerCase();
    return host.includes("cityheaven.net");
  } catch {
    return false;
  }
};

const worker = async (rows, startIndex, step, state) => {
  for (let i = startIndex; i < rows.length; i += step) {
    const row = rows[i];
    const queries = buildSearchQueries(row);
    let searchUrl = null;
    let selectedCityheavenUrl = null;
    let officialUrl = null;
    let officialSource = "unresolved";
    let externalResult = null;
    let matchedQuery = null;
    let error = null;

    try {
      for (const query of queries) {
        const currentSearchUrl = buildYahooUrl(query);
        const searchFetch = await fetchHtmlWithCurl(currentSearchUrl, {
          maxRetry: YAHOO_RETRY_MAX,
        });
        const searchHtml = searchFetch.html;
        if (searchFetch.blocked) {
          if (DEBUG_VERBOSE && i < 2) {
            console.log(
              `[debug] idx=${i} query=\"${query}\" yahoo_blocked=true attempts=${searchFetch.attempts}`
            );
          }
          await sleep(WAIT_MS);
          continue;
        }
        const results = parseYahooResults(searchHtml);
        const cityheavenResult = results.find((r) => isCityheavenUrl(r.href));
        if (DEBUG_VERBOSE && i < 2) {
          console.log(
            `[debug] idx=${i} query=\"${query}\" results=${results.length} cityheaven=${cityheavenResult?.href ?? "none"}`
          );
        }
        if (cityheavenResult?.href) {
          matchedQuery = query;
          searchUrl = currentSearchUrl;
          selectedCityheavenUrl = normalizeCityheavenUrl(cityheavenResult.href);
          await sleep(WAIT_MS);
          const chHtml = (await fetchHtmlWithCurl(selectedCityheavenUrl)).html;
          officialUrl = extractOfficialUrlFromCityheaven(chHtml);
          if (officialUrl) {
            officialSource = "cityheaven_official_pc";
            break;
          }
        }

        // cityheaven経由で拾えない場合は、検索結果から直接公式候補を推定
        const external = pickExternalOfficialFromYahooResults(results, row);
        if (external) {
          matchedQuery = query;
          searchUrl = currentSearchUrl;
          officialUrl = external.href;
          officialSource = "yahoo_external_heuristic";
          externalResult = external;
          break;
        }

        await sleep(WAIT_MS);
      }
    } catch (e) {
      error = e instanceof Error ? e.message : "不明なエラー";
    }

    const result = {
      ...row,
      officialUrlCandidate: officialUrl,
      candidateSource: officialUrl ? officialSource : "unresolved",
      confidence:
        officialSource === "cityheaven_official_pc"
          ? 0.96
          : officialSource === "yahoo_external_heuristic"
            ? Math.min(0.86, Math.max(0.55, (externalResult?.score ?? 55) / 100))
            : 0,
      evidence: {
        searchUrl,
        searchQuery: matchedQuery,
        cityheavenUrl: selectedCityheavenUrl,
        externalCandidate: externalResult
          ? {
              href: externalResult.href,
              host: externalResult.host,
              title: externalResult.title,
              score: externalResult.score,
            }
          : null,
      },
      enrichedAt: new Date().toISOString(),
      error,
    };

    state.results[i] = result;
    state.processed += 1;
    if (state.processed % 10 === 0 || state.processed === rows.length) {
      const resolved = state.results.filter((r) => r && r.officialUrlCandidate).length;
      console.log(`[進捗] ${state.processed}/${rows.length} (候補あり: ${resolved})`);
    }
    await sleep(WAIT_MS);
  }
};

const main = async () => {
  const inputPath = process.argv[2] ? resolve(process.argv[2]) : DEFAULT_INPUT;
  const outputPath = process.argv[3] ? resolve(process.argv[3]) : DEFAULT_OUTPUT;
  const mergedOutputPath = process.argv[4]
    ? resolve(process.argv[4])
    : DEFAULT_MERGED_OUTPUT;
  const baseWorklistPath = process.argv[5]
    ? resolve(process.argv[5])
    : DEFAULT_BASE_WORKLIST;

  const unresolvedRows = JSON.parse(await readFile(inputPath, "utf-8"));
  if (!Array.isArray(unresolvedRows)) {
    throw new Error("入力JSONが配列ではありません。");
  }

  console.log(`対象件数: ${unresolvedRows.length}`);

  const state = {
    results: new Array(unresolvedRows.length),
    processed: 0,
  };

  const runners = [];
  for (let i = 0; i < CONCURRENCY; i += 1) {
    runners.push(worker(unresolvedRows, i, CONCURRENCY, state));
  }
  await Promise.all(runners);

  const results = state.results;
  const resolvedCount = results.filter((r) => r.officialUrlCandidate).length;
  const unresolvedCount = results.length - resolvedCount;

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(results, null, 2), "utf-8");

  const baseWorklist = JSON.parse(await readFile(baseWorklistPath, "utf-8"));
  if (!Array.isArray(baseWorklist)) {
    throw new Error("ベースワークリストJSONが配列ではありません。");
  }
  const byId = new Map(results.map((r) => [r.id, r]));
  const merged = baseWorklist.map((row) => {
    const candidate = byId.get(row.id);
    if (!candidate) return row;
    return {
      ...row,
      officialUrlCandidate: candidate.officialUrlCandidate ?? row.officialUrlCandidate ?? null,
      candidateSource: candidate.candidateSource ?? row.candidateSource ?? "unresolved",
      confidence: candidate.confidence ?? row.confidence ?? 0,
      evidence: candidate.evidence ?? null,
      enrichedAt: candidate.enrichedAt ?? null,
      enrichmentError: candidate.error ?? null,
    };
  });
  await writeFile(mergedOutputPath, JSON.stringify(merged, null, 2), "utf-8");

  const summary = {
    generatedAt: new Date().toISOString(),
    inputPath,
    outputPath,
    mergedOutputPath,
    total: results.length,
    resolvedCount,
    unresolvedCount,
    method: "yahoo_search_and_cityheaven_official_pc",
  };
  const summaryPath = outputPath.replace(/\.json$/i, ".summary.json");
  await writeFile(summaryPath, JSON.stringify(summary, null, 2), "utf-8");

  console.log("完了");
  console.log(`候補あり: ${resolvedCount}`);
  console.log(`未解決: ${unresolvedCount}`);
  console.log(`出力: ${outputPath}`);
  console.log(`統合: ${mergedOutputPath}`);
  console.log(`概要: ${summaryPath}`);
};

main().catch((error) => {
  console.error("URL候補抽出に失敗しました:", error);
  process.exitCode = 1;
});
