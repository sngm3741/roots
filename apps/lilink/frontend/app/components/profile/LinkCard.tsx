import { Link2 } from "lucide-react";
import type { LinkItem } from "~/types/profile";

type LinkCardProps = {
  link: LinkItem;
};

export function LinkCard({ link }: LinkCardProps) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="lilink-card grid grid-cols-[56px_1fr] items-center gap-4 px-4 py-3 transition"
    >
      <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-lilink-bg">
        {link.iconUrl ? (
          <img
            src={link.iconUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="grid h-10 w-10 place-items-center rounded-xl lilink-chip text-lilink-accent">
            <Link2 className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="grid gap-1">
        <span className="text-sm font-medium text-lilink-ink">{link.title}</span>
        <span className="text-xs text-lilink-muted">{link.url}</span>
      </div>
    </a>
  );
}
