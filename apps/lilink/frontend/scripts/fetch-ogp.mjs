import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const TARGET = resolve(
  "apps/lilink/frontend/app/data/pages/kiriko/video.json",
);

const extractMeta = (html, name) => {
  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return null;
};

const fetchOgpImage = async (url) => {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });
  const html = await response.text();
  return (
    extractMeta(html, "og:image") ||
    extractMeta(html, "og:image:secure_url")
  );
};

const main = async () => {
  const raw = await readFile(TARGET, "utf8");
  const items = JSON.parse(raw);
  const nextItems = await Promise.all(
    items.map(async (item) => {
      if (!item?.linkUrl || item.imageUrl) {
        return item;
      }
      try {
        const ogpImageUrl = await fetchOgpImage(item.linkUrl);
        return ogpImageUrl
          ? { ...item, imageUrl: ogpImageUrl }
          : item;
      } catch {
        return item;
      }
    }),
  );
  await writeFile(TARGET, `${JSON.stringify(nextItems, null, 2)}\n`);
};

await main();
