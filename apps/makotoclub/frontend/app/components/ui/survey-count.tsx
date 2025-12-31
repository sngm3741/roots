type Props = {
  count: number;
  className?: string;
  label?: string;
};

export function SurveyCount({ count, className, label = "件" }: Props) {
  return (
    <div className={`flex items-center gap-1.5 text-sm text-slate-600 ${className ?? ""}`}>
      <MessageSquareIcon />
      <span>
        {count} {label}
      </span>
    </div>
  );
}

function MessageSquareIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
    </svg>
  );
}
