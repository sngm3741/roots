import type { ServiceGroup } from "../../data/services";
import ServiceGroupItem from "../molecules/ServiceGroup";
import NarrowSection from "../molecules/NarrowSection";

type ServicesSectionProps = {
  groups: ServiceGroup[];
};

export default function ServicesSection({ groups }: ServicesSectionProps) {
  return (
    <NarrowSection className="pb-8" size="medium">
      <div className="flex justify-center">
        <div className="text-left text-slate-600 dark:text-slate-300">
          <div className="space-y-4">
            {groups.map((group) => (
              <ServiceGroupItem key={group.title} title={group.title} items={group.items} />
            ))}
          </div>
        </div>
      </div>
    </NarrowSection>
  );
}
