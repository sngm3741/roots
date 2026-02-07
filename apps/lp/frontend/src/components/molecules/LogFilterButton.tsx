type LogFilterButtonProps = {
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
};

export default function LogFilterButton({
  active,
  icon,
  label,
  onClick,
}: LogFilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
    className="flex flex-col items-center gap-2 text-body-sm text-slate-600 dark:text-slate-300"
  >
    <span
      className={`flex h-12 w-12 items-center justify-center rounded-full border text-lg transition ${
        active
          ? "border-violet-300 bg-white shadow-sm dark:border-violet-400/40 dark:bg-slate-900"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      }`}
    >
      {icon}
    </span>
    <span className={active ? "text-slate-700 dark:text-slate-100" : "text-slate-500"}>
      {label}
    </span>
  </button>
);
}
