type Grid12Props = {
  children: React.ReactNode;
  gap?: string;
  className?: string;
};

const joinClass = (...values: Array<string | undefined | false>) =>
  values.filter(Boolean).join(" ");

export function Grid12({ children, gap = "6", className }: Grid12Props) {
  return (
    <div
      className={joinClass(
        "grid grid-cols-12",
        gap ? `gap-${gap}` : undefined,
        className,
      )}
    >
      {children}
    </div>
  );
}
