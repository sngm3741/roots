import LinkCard from './LinkCard';

interface Link {
  id: string;
  title: string;
  url: string;
  icon?: string;
  visible?: boolean;
  order?: number;
}

interface LinkListProps {
  links: Link[];
}

export default function LinkList({ links }: LinkListProps) {
  const visibleLinks = links
    .filter((link) => link.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="col-span-12 sm:col-start-2 sm:col-span-10 md:col-start-3 md:col-span-8 lg:col-start-4 lg:col-span-6">
      <div className="grid grid-cols-1 gap-3">
        {visibleLinks.map((link) => (
          <LinkCard
            key={link.id}
            title={link.title}
            url={link.url}
            icon={link.icon}
          />
        ))}
      </div>
    </div>
  );
}
