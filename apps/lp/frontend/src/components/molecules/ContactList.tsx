import ContactRow from "./ContactRow";
import type { ContactItem } from "../../data/contacts";

type ContactListProps = {
  items: ContactItem[];
};

export default function ContactList({ items }: ContactListProps) {
  return (
    <div className="mt-8 flex w-full justify-center text-body text-slate-600 dark:text-slate-200">
      <div className="inline-flex flex-col items-start space-y-5">
        {items.map((item) => (
          <ContactRow
            key={item.key}
            icon={item.icon}
            text={item.text}
            badgeClassName={item.badgeClassName}
          />
        ))}
      </div>
    </div>
  );
}
