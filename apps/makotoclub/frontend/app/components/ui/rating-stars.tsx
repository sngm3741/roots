type Props = {
  value: number;
  max?: number;
  size?: "sm" | "md";
};

export function RatingStars({ value, max = 5, size = "md" }: Props) {
  const clamped = Math.max(0, Math.min(value, max));
  const stars = "★".repeat(max);
  const sizeClass = size === "sm" ? "text-sm" : "text-base";
  const widthPercent = `${(clamped / max) * 100}%`;

  return (
    <div className={`relative inline-flex items-center ${sizeClass}`} aria-label={`評価 ${clamped} / ${max}`}>
      <span className="text-slate-300">{stars}</span>
      <span
        className="absolute left-0 top-0 overflow-hidden text-pink-500"
        style={{ width: widthPercent }}
        aria-hidden="true"
      >
        {stars}
      </span>
    </div>
  );
}
