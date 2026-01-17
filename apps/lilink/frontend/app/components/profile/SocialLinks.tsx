import { Cloud, Globe, Instagram, MessageCircle, Youtube } from "lucide-react";
import type { SocialLink, SocialKind } from "~/types/profile";

const ICONS: Record<SocialKind, typeof Globe> = {
  x: Globe,
  bluesky: Cloud,
  instagram: Instagram,
  line: MessageCircle,
  youtube: Youtube,
  website: Globe,
};

const ORDER: SocialKind[] = ["x", "bluesky", "instagram", "line", "youtube", "website"];

const XIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 1200 1227"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"
      fill="currentColor"
    />
  </svg>
);

const BlueskyIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 600 530"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z"
      fill="currentColor"
    />
  </svg>
);

type SocialLinksProps = {
  socialLinks: SocialLink[];
};

type SocialLinkButtonProps = {
  item: SocialLink;
};

const SocialLinkButton = ({ item }: SocialLinkButtonProps) => {
  const Icon = ICONS[item.kind];
  const isX = item.kind === "x";
  const isBluesky = item.kind === "bluesky";

  return (
    <a
      key={item.kind}
      href={item.url}
      target="_blank"
      rel="noreferrer"
      aria-label={item.description}
      className="col-span-4 grid min-w-0 place-items-center gap-1 rounded-2xl border border-lilink-border bg-white px-3 py-2 text-center text-lilink-ink transition hover:border-lilink-accent hover:text-lilink-accent sm:col-span-3 md:col-span-2"
    >
      <span
        className={
          isX
            ? "grid h-8 w-8 place-items-center rounded-full bg-black text-white"
            : isBluesky
              ? "grid h-8 w-8 place-items-center rounded-full bg-[#1185fe] text-white"
              : "grid h-8 w-8 place-items-center rounded-full bg-lilink-bg"
        }
      >
        {isX ? (
          <XIcon />
        ) : isBluesky ? (
          <BlueskyIcon />
        ) : (
          <Icon className="h-4 w-4" />
        )}
      </span>
      {item.handle ? (
        <span className="w-full break-all text-[10px] text-lilink-muted">
          {item.handle}
        </span>
      ) : null}
      <span className="w-full break-words text-[11px] font-medium">
        {item.description}
      </span>
    </a>
  );
};

export function SocialLinks({ socialLinks }: SocialLinksProps) {
  if (socialLinks.length === 0) {
    return null;
  }

  const items = [...socialLinks].sort(
    (a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind),
  );

  return (
    <section className="grid grid-cols-12 gap-3">
      <div className="col-span-12 grid grid-cols-12 gap-3">
        {items.map((item) => (
          <SocialLinkButton key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
