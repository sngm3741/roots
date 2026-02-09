type LinkType =
  | "recruitment"
  | "official"
  | "line"
  | "x"
  | "bsky"
  | "phone"
  | "email";

type OutboundClickPayload = {
  storeId: string;
  storeName: string;
  linkType: LinkType;
  targetUrl: string;
};

const SESSION_COOKIE_NAME = "mc_sid";

const readCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${escapedName}=([^;]+)`));
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
};

const readUtmParams = () => {
  if (typeof window === "undefined") {
    return { utmSource: null, utmMedium: null, utmCampaign: null };
  }
  const search = new URLSearchParams(window.location.search);
  const read = (key: string) => {
    const value = search.get(key);
    return value && value.trim() ? value.trim() : null;
  };
  return {
    utmSource: read("utm_source"),
    utmMedium: read("utm_medium"),
    utmCampaign: read("utm_campaign"),
  };
};

export const trackOutboundClick = (payload: OutboundClickPayload) => {
  if (typeof window === "undefined") return;
  const utm = readUtmParams();
  const body = JSON.stringify({
    storeId: payload.storeId,
    storeName: payload.storeName,
    linkType: payload.linkType,
    targetUrl: payload.targetUrl,
    path: window.location.pathname || "/",
    referrer: document.referrer || null,
    sessionId: readCookie(SESSION_COOKIE_NAME),
    ...utm,
  });
  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    const ok = navigator.sendBeacon("/api/metrics/v2/outbound-click", blob);
    if (ok) return;
  }
  void fetch("/api/metrics/v2/outbound-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  });
};
