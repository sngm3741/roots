import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const App = lazy(() => import("./App"));
const NotesPage = lazy(() => import("./pages/NotesPage"));
const NotePage = lazy(() => import("./pages/NotePage"));

export default function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white px-6 py-12 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
          <div className="mx-auto w-full max-w-3xl text-center text-body-sm text-slate-500 dark:text-slate-400">
            Loading...
          </div>
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/notes/:slug" element={<NotePage />} />
      </Routes>
    </Suspense>
  );
}
