import { Suspense, lazy } from "react";
import type { Note } from "../../data/notes";
import TagList from "../molecules/TagList";

type NoteArticleProps = {
  note: Note;
};

const MarkdownRenderer = lazy(() => import("../molecules/MarkdownRenderer"));

export default function NoteArticle({ note }: NoteArticleProps) {
  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-title tracking-tight text-slate-900 dark:text-slate-100">
          {note.meta.title}
        </h1>
        <div className="mt-4 text-body-sm text-slate-500 dark:text-slate-400">
          {note.meta.displayDate}
        </div>
        <TagList tags={note.meta.tags} />
      </div>

      <div className="mb-8 border-t border-slate-200" />

      <Suspense
        fallback={<div className="text-body-sm text-slate-500 dark:text-slate-400">Loading…</div>}
      >
        <MarkdownRenderer content={note.content} />
      </Suspense>
    </>
  );
}
