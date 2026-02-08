import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

const HEARTBEAT_INTERVAL_MS = 30000;
const SESSION_COOKIE_NAME = "mc_sid";
const SESSION_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30;

type ExitType = "navigate" | "pagehide" | "unload" | "end";

type ViewState = {
  pageViewId: string;
  path: string;
  startedAt: number;
  lastBeatAt: number;
};

const createRandomId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `pv_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const readCookie = (name: string): string | null => {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${escapedName}=([^;]+)`));
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
};

const ensureSessionId = () => {
  const current = readCookie(SESSION_COOKIE_NAME);
  if (current) return current;
  const next = createRandomId();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(next)}; Path=/; Max-Age=${SESSION_COOKIE_MAX_AGE_SEC}; SameSite=Lax${secure}`;
  return next;
};

const readUtmParams = () => {
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

const sendEvent = (payload: Record<string, unknown>) => {
  const body = JSON.stringify(payload);
  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    const ok = navigator.sendBeacon("/api/metrics/v2/events", blob);
    if (ok) return;
  }
  void fetch("/api/metrics/v2/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  });
};

export function PageAnalyticsTracker() {
  const location = useLocation();
  const currentRef = useRef<ViewState | null>(null);
  const endedPageViewIdRef = useRef<string | null>(null);
  const previousUrlRef = useRef<string>("");

  useEffect(() => {
    const sessionId = ensureSessionId();
    const now = Date.now();
    const path = location.pathname || "/";
    const pageViewId = createRandomId();
    const current: ViewState = {
      pageViewId,
      path,
      startedAt: now,
      lastBeatAt: now,
    };
    currentRef.current = current;
    endedPageViewIdRef.current = null;

    const utm = readUtmParams();
    const referrer = previousUrlRef.current || document.referrer || null;
    sendEvent({
      type: "start",
      sessionId,
      pageViewId,
      path,
      referrer,
      ...utm,
    });

    const sendEnd = (exitType: ExitType) => {
      const target = currentRef.current;
      if (!target) return;
      if (endedPageViewIdRef.current === target.pageViewId) return;
      endedPageViewIdRef.current = target.pageViewId;
      const endNow = Date.now();
      const activeMs =
        document.visibilityState === "visible"
          ? Math.max(0, Math.min(endNow - target.lastBeatAt, HEARTBEAT_INTERVAL_MS))
          : 0;
      sendEvent({
        type: "end",
        sessionId,
        pageViewId: target.pageViewId,
        path: target.path,
        activeMs,
        exitType,
      });
    };

    const sendHeartbeat = () => {
      const target = currentRef.current;
      if (!target) return;
      if (endedPageViewIdRef.current === target.pageViewId) return;
      const beatNow = Date.now();
      const activeMs = Math.max(0, Math.min(beatNow - target.lastBeatAt, HEARTBEAT_INTERVAL_MS));
      target.lastBeatAt = beatNow;
      sendEvent({
        type: "heartbeat",
        sessionId,
        pageViewId: target.pageViewId,
        path: target.path,
        activeMs,
      });
    };

    const intervalId = window.setInterval(() => {
      const target = currentRef.current;
      if (!target) return;
      if (document.visibilityState !== "visible") return;
      sendHeartbeat();
    }, HEARTBEAT_INTERVAL_MS);

    const handlePageHide = () => {
      sendEnd("pagehide");
    };
    const handleBeforeUnload = () => {
      sendEnd("unload");
    };
    const handleVisibilityChange = () => {
      const target = currentRef.current;
      if (!target) return;
      if (document.visibilityState === "hidden") {
        sendHeartbeat();
      } else {
        target.lastBeatAt = Date.now();
      }
    };

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    previousUrlRef.current = `${window.location.origin}${path}${window.location.search}`;

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      sendEnd("navigate");
    };
  }, [location.pathname, location.search]);

  return null;
}
