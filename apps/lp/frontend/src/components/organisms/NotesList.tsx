import { Link } from "react-router-dom";
import type { Note } from "../../data/notes";

const categoryEmoji: Record<string, string> = {
  writing: "✍️",
  release: "🎉",
  misc: "💡",
};

type NotesListProps = {
  notes: Note[];
};

export default function NotesList({ notes }: NotesListProps) {
  return (
    <div className="divide-y divide-slate-200 border-b border-slate-200">
      {notes.map((note) => (
        <Link
          key={note.meta.slug}
          to={`/notes/${note.meta.slug}`}
          className="flex items-center gap-4 px-2 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-900"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl dark:bg-slate-900">
            {categoryEmoji[note.meta.category] ?? "✏️"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-body font-semibold text-slate-900 dark:text-slate-100">
              {note.meta.title}
            </p>
            <p className="mt-1 text-caption text-slate-500 dark:text-slate-400">
              {note.meta.displayDate}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
