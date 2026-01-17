import type { LinkItem } from "~/types/profile";
import { LinkCard } from "./LinkCard";

type LinkListProps = {
  links: LinkItem[];
};

export function LinkList({ links }: LinkListProps) {
  if (links.length === 0) {
    return (
      <section className="lilink-card grid grid-cols-12 gap-2 px-4 py-6 text-center">
        <p className="col-span-12 text-sm font-medium">
          リンクがまだありません
        </p>
        <p className="col-span-12 text-xs text-lilink-muted">
          後ほど追加される予定です。
        </p>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-12 gap-3">
      {links.map((link) => (
        <div key={link.id} className="col-span-12">
          <LinkCard link={link} />
        </div>
      ))}
    </section>
  );
}
