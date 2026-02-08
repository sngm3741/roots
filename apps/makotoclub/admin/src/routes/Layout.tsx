import { NavLink, Outlet } from "react-router-dom";
import { Button } from "../components/ui/button";

export const Layout = () => {
  return (
    <div className="min-h-screen text-slate-900">
      <header className="sticky top-0 z-20 mx-4 mt-4 glass-surface rounded-2xl border border-pink-100/60 px-4 py-3 shadow-xl shadow-pink-100/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500" />
            <div>
              <div className="text-sm font-semibold text-pink-600">MakotoClub</div>
              <div className="text-lg font-bold">Admin Console</div>
            </div>
          </div>
          <nav className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <NavLink
              to="/stores"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 transition hover:text-slate-900 ${
                  isActive ? "bg-pink-50 text-slate-900" : ""
                }`
              }
            >
              店舗管理
            </NavLink>
            <NavLink
              to="/surveys"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 transition hover:text-slate-900 ${
                  isActive ? "bg-pink-50 text-slate-900" : ""
                }`
              }
            >
              アンケート管理
            </NavLink>
            <NavLink
              to="/surveys/drafts"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 transition hover:text-slate-900 ${
                  isActive ? "bg-pink-50 text-slate-900" : ""
                }`
              }
            >
              投稿アンケート
            </NavLink>
            <NavLink
              to="/access-logs"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 transition hover:text-slate-900 ${
                  isActive ? "bg-pink-50 text-slate-900" : ""
                }`
              }
            >
              アクセスログ
            </NavLink>
            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 transition hover:text-slate-900 ${
                  isActive ? "bg-pink-50 text-slate-900" : ""
                }`
              }
            >
              解析
            </NavLink>
          </nav>
          <Button variant="secondary" size="sm">
            管理
          </Button>
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-10 pt-6">
        <Outlet />
      </main>
    </div>
  );
};
