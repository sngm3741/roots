import { useEffect, useState } from "react";

const STORAGE_KEY = "store-bookmarks";

const readBookmarks = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const notifyChange = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("store-bookmarks:change"));
};

const writeBookmarks = (ids: string[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    notifyChange();
  } catch {
    // localStorage が使えない環境では無視
  }
};

export const getStoreBookmarks = () => readBookmarks();

export const isStoreBookmarked = (storeId: string) => readBookmarks().includes(storeId);

export const toggleStoreBookmark = (storeId: string) => {
  const current = readBookmarks();
  const next = current.includes(storeId)
    ? current.filter((id) => id !== storeId)
    : [...current, storeId];
  writeBookmarks(next);
  return next.includes(storeId);
};

export const useStoreBookmark = (storeId: string) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    setIsBookmarked(isStoreBookmarked(storeId));
  }, [storeId]);

  const toggle = () => {
    setIsBookmarked(toggleStoreBookmark(storeId));
  };

  return { isBookmarked, toggle };
};

export const useStoreBookmarks = () => {
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);

  useEffect(() => {
    setBookmarkIds(readBookmarks());
    const handler = () => setBookmarkIds(readBookmarks());
    window.addEventListener("storage", handler);
    window.addEventListener("store-bookmarks:change", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("store-bookmarks:change", handler);
    };
  }, []);

  const clear = () => {
    writeBookmarks([]);
    setBookmarkIds([]);
  };

  const toggle = (storeId: string) => {
    const current = readBookmarks();
    const next = current.includes(storeId)
      ? current.filter((id) => id !== storeId)
      : [...current, storeId];
    writeBookmarks(next);
    setBookmarkIds(next);
    return next.includes(storeId);
  };

  return { bookmarkIds, clear, toggle };
};
