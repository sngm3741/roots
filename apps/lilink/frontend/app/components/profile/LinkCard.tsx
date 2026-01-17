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
      className="lilink-card grid grid-cols-12 items-center gap-4 px-4 py-4 transition"
    >
      <div className="col-span-2 grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-lilink-bg sm:col-span-1">
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
      <div className="col-span-10 grid gap-2 sm:col-span-11">
        <div className="grid gap-1">
          {link.title ? (
            <span className="text-sm font-semibold text-lilink-ink">
              {link.title}
            </span>
          ) : null}
          <span className="text-sm text-lilink-ink">{link.description}</span>
        </div>
        <span className="text-xs text-lilink-muted">{link.url}</span>
      </div>
    </a>
  );
}
