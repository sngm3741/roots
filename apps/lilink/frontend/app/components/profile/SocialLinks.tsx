import {
  Globe,
  Instagram,
  MessageCircle,
  Twitter,
  Youtube,
} from "lucide-react";
import type { SocialLink, SocialKind } from "~/types/profile";

const ICONS: Record<SocialKind, typeof Globe> = {
  x: Twitter,
  instagram: Instagram,
  line: MessageCircle,
  youtube: Youtube,
  website: Globe,
};

const LABELS: Record<SocialKind, string> = {
  x: "X",
  instagram: "Instagram",
  line: "LINE",
  youtube: "YouTube",
  website: "Webサイト",
};

const ORDER: SocialKind[] = ["x", "instagram", "line", "youtube", "website"];

type SocialLinksProps = {
  socialLinks: SocialLink[];
};

export function SocialLinks({ socialLinks }: SocialLinksProps) {
  if (socialLinks.length === 0) {
    return null;
  }

  const items = [...socialLinks].sort(
    (a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind),
  );

  return (
    <section className="grid gap-3">
      <div className="grid grid-flow-col auto-cols-fr gap-3">
        {items.map((item) => {
          const Icon = ICONS[item.kind];
          return (
            <a
              key={item.kind}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              aria-label={LABELS[item.kind]}
              className="grid h-11 place-items-center rounded-full border border-lilink-border bg-white text-lilink-ink transition hover:border-lilink-accent hover:text-lilink-accent"
            >
              <Icon className="h-5 w-5" />
            </a>
          );
        })}
      </div>
    </section>
  );
}
