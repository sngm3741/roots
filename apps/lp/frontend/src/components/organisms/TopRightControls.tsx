import { Globe2, Moon, Sun } from "lucide-react";
import { useI18n } from "../../contexts/I18nContext";
import { useTheme } from "../../contexts/ThemeContext";

export default function TopRightControls() {
  const { lang, toggleLang } = useI18n();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="absolute right-4 top-4 z-50 flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={toggleLang}
        className="flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:text-white"
        aria-label="Language toggle"
      >
        <Globe2 size={16} />
        <span>{lang === "ja" ? "EN" : "JA"}</span>
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:text-white"
        aria-label="Theme toggle"
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>
  );
}
