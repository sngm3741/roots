import type { LinkItem } from "~/types/profile";
import { LinkCard } from "./LinkCard";

type LinkListProps = {
  links: LinkItem[];
};

export function LinkList({ links }: LinkListProps) {
  if (links.length === 0) {
    return (
      <section className="lilink-card grid gap-2 px-4 py-6 text-center">
        <p className="text-sm font-medium">リンクがまだありません</p>
        <p className="text-xs text-lilink-muted">後ほど追加される予定です。</p>
      </section>
    );
  }

  return (
    <section className="grid gap-3">
      {links.map((link) => (
        <LinkCard key={link.id} link={link} />
      ))}
    </section>
  );
}
