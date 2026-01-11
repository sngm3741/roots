type Props = {
  variant?: "main" | "reply";
  name: string;
  body: string;
  onNameChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  nameMaxLength?: number;
  bodyMaxLength?: number;
  submitLabel?: string;
  namePlaceholder?: string;
  bodyPlaceholder?: string;
  nameLabel?: string;
  bodyLabel?: string;
};

export function CommentComposer({
  variant = "main",
  name,
  body,
  onNameChange,
  onBodyChange,
  onSubmit,
  isSubmitting = false,
  nameMaxLength = 40,
  bodyMaxLength = 1000,
  submitLabel,
  namePlaceholder,
  bodyPlaceholder,
  nameLabel,
  bodyLabel,
}: Props) {
  const isMain = variant === "main";
  const resolvedSubmitLabel = submitLabel ?? (isMain ? "送信" : "返信投稿");
  const resolvedNamePlaceholder =
    namePlaceholder ?? (isMain ? "お名前を入力" : "ハンドルネーム（任意）");
  const resolvedBodyPlaceholder =
    bodyPlaceholder ?? (isMain ? "コメントを入力してください..." : "返信を書く（1000文字まで）");
  const resolvedNameLabel = nameLabel ?? "ハンドルネーム（任意）";
  const resolvedBodyLabel = bodyLabel ?? "内容";

  return (
    <div className={isMain ? "space-y-4" : "space-y-2 rounded-xl border border-pink-100 bg-pink-50/40 p-3"}>
      {isMain ? (
        <div className="space-y-2">
          <label className="text-sm text-slate-600">{resolvedNameLabel}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
            placeholder={resolvedNamePlaceholder}
            maxLength={nameMaxLength}
          />
        </div>
      ) : (
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-pink-400 focus:outline-none"
          placeholder={resolvedNamePlaceholder}
          maxLength={nameMaxLength}
        />
      )}

      {isMain ? (
        <div className="space-y-2">
          <label className="text-sm text-slate-600">{resolvedBodyLabel}</label>
          <textarea
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            className="w-full min-h-[160px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-pink-400 focus:outline-none resize-none"
            placeholder={resolvedBodyPlaceholder}
            maxLength={bodyMaxLength}
          />
          <div className="flex items-center justify-between text-xs">
            <span
              className={
                body.length > bodyMaxLength * 0.9 ? "text-pink-600" : "text-slate-500"
              }
            >
              {body.length} / {bodyMaxLength}
            </span>
          </div>
        </div>
      ) : (
        <textarea
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          className="w-full min-h-[80px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
          placeholder={resolvedBodyPlaceholder}
          maxLength={bodyMaxLength}
        />
      )}

      <div className={isMain ? "flex justify-end pt-2" : "flex items-center justify-end gap-2"}>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || (isMain ? !body.trim() : false)}
          className={
            isMain
              ? "rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-pink-600 hover:to-purple-700 disabled:opacity-50"
              : "rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:from-pink-600 hover:to-purple-700 disabled:opacity-60"
          }
        >
          {resolvedSubmitLabel}
        </button>
      </div>
    </div>
  );
}
