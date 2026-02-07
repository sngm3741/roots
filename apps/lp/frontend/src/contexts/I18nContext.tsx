import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { I18nKey, Language } from "../data/i18n";
import { dictionaries } from "../data/i18n";

type I18nContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: I18nKey, vars?: Record<string, string>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "lp_lang";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("ja");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved === "ja" || saved === "en") setLang(saved);
  }, []);

  const updateLang = useCallback((next: Language) => {
    setLang(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleLang = useCallback(() => {
    updateLang(lang === "ja" ? "en" : "ja");
  }, [lang, updateLang]);

  const t = useCallback(
    (key: I18nKey, vars?: Record<string, string>) => {
      const template = dictionaries[lang][key] ?? key;
      if (!vars) return template;
      return Object.entries(vars).reduce(
        (acc, [k, v]) => acc.replaceAll(`{${k}}`, v),
        template,
      );
    },
    [lang],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ lang, setLang: updateLang, toggleLang, t }),
    [lang, toggleLang, t, updateLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("I18nProvider が見つかりません。");
  }
  return ctx;
}
