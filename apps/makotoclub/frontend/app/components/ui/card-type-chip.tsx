type Props = {
  label: string;
  variant: "survey" | "store";
};

export function CardTypeChip({ label, variant }: Props) {
  const styles =
    variant === "survey"
      ? "border-pink-100 bg-pink-50 text-pink-700"
      : "border-sky-100 bg-sky-50 text-sky-700";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${styles}`}
    >
      {variant === "survey" ? <SurveyIcon /> : <StoreIcon />}
      {label}
    </span>
  );
}

function SurveyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 20h4l10-10-4-4L4 16v4z" />
      <path d="M14 6l4 4" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 9l9-5 9 5" />
      <path d="M4 10v10h16V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}
