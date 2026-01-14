import { useEffect, useState } from "react";

const STORAGE_KEY = "survey-bookmarks";

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
  window.dispatchEvent(new Event("survey-bookmarks:change"));
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

export const getSurveyBookmarks = () => readBookmarks();

export const isSurveyBookmarked = (surveyId: string) => readBookmarks().includes(surveyId);

export const toggleSurveyBookmark = (surveyId: string) => {
  const current = readBookmarks();
  const next = current.includes(surveyId)
    ? current.filter((id) => id !== surveyId)
    : [...current, surveyId];
  writeBookmarks(next);
  return next.includes(surveyId);
};

export const useSurveyBookmark = (surveyId: string) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    setIsBookmarked(isSurveyBookmarked(surveyId));
  }, [surveyId]);

  const toggle = () => {
    setIsBookmarked(toggleSurveyBookmark(surveyId));
  };

  return { isBookmarked, toggle };
};

export const useSurveyBookmarks = () => {
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);

  useEffect(() => {
    setBookmarkIds(readBookmarks());
    const handler = () => setBookmarkIds(readBookmarks());
    window.addEventListener("storage", handler);
    window.addEventListener("survey-bookmarks:change", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("survey-bookmarks:change", handler);
    };
  }, []);

  const clear = () => {
    writeBookmarks([]);
    setBookmarkIds([]);
  };

  const toggle = (surveyId: string) => {
    const current = readBookmarks();
    const next = current.includes(surveyId)
      ? current.filter((id) => id !== surveyId)
      : [...current, surveyId];
    writeBookmarks(next);
    setBookmarkIds(next);
    return next.includes(surveyId);
  };

  return { bookmarkIds, clear, toggle };
};
