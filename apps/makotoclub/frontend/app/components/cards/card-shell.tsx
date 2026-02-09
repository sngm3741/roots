import clsx from "clsx";
import { Link } from "react-router";

type Props = {
  children: React.ReactNode;
  href?: string;
  className?: string;
  ariaLabel?: string;
};

export function CardShell({ children, href, className, ariaLabel }: Props) {
  const content = (
    <div
      className={clsx(
        "relative overflow-hidden rounded-3xl border border-pink-100/80 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.12)] transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[0_30px_80px_rgba(15,23,42,0.16)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute right-2 top-2 h-16 w-16 rounded-full bg-gradient-to-br from-pink-200/50 to-purple-200/50 blur-2xl" />
      {children}
      {href ? (
        <Link to={href} className="absolute inset-0" aria-label={ariaLabel} />
      ) : null}
    </div>
  );

  return href ? content : <div className="relative">{content}</div>;
}
