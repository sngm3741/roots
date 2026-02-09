import { useEffect, useState } from "react";

type BookmarkStore = {
  getBookmarks: () => string[];
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (id: string) => boolean;
  useBookmark: (id: string) => { isBookmarked: boolean; toggle: () => void };
  useBookmarks: () => {
    bookmarkIds: string[];
    clear: () => void;
    toggle: (id: string) => boolean;
  };
};

export const createBookmarkStore = (
  storageKey: string,
  changeEventName: string,
): BookmarkStore => {
  const readBookmarks = () => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(storageKey);
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const notifyChange = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event(changeEventName));
  };

  const writeBookmarks = (ids: string[]) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(ids));
      notifyChange();
    } catch {
      // localStorage が使えない環境では無視
    }
  };

  const getBookmarks = () => readBookmarks();
  const isBookmarked = (id: string) => readBookmarks().includes(id);
  const toggleBookmark = (id: string) => {
    const current = readBookmarks();
    const next = current.includes(id)
      ? current.filter((bookmarkId) => bookmarkId !== id)
      : [...current, id];
    writeBookmarks(next);
    return next.includes(id);
  };

  const useBookmark = (id: string) => {
    const [bookmarked, setBookmarked] = useState(false);

    useEffect(() => {
      setBookmarked(isBookmarked(id));
    }, [id]);

    const toggle = () => {
      setBookmarked(toggleBookmark(id));
    };

    return { isBookmarked: bookmarked, toggle };
  };

  const useBookmarks = () => {
    const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);

    useEffect(() => {
      setBookmarkIds(readBookmarks());
      const handler = () => setBookmarkIds(readBookmarks());
      window.addEventListener("storage", handler);
      window.addEventListener(changeEventName, handler);
      return () => {
        window.removeEventListener("storage", handler);
        window.removeEventListener(changeEventName, handler);
      };
    }, []);

    const clear = () => {
      writeBookmarks([]);
      setBookmarkIds([]);
    };

    const toggle = (id: string) => {
      const current = readBookmarks();
      const next = current.includes(id)
        ? current.filter((bookmarkId) => bookmarkId !== id)
        : [...current, id];
      writeBookmarks(next);
      setBookmarkIds(next);
      return next.includes(id);
    };

    return { bookmarkIds, clear, toggle };
  };

  return {
    getBookmarks,
    isBookmarked,
    toggleBookmark,
    useBookmark,
    useBookmarks,
  };
};
