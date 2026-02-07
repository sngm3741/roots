import type { ReactNode } from "react";
import IconBadge from "../atoms/IconBadge";

type ContactRowProps = {
  icon: ReactNode;
  text: ReactNode;
  badgeClassName?: string;
};

export default function ContactRow({ icon, text, badgeClassName }: ContactRowProps) {
  return (
    <div className="flex items-center gap-2">
      <IconBadge className={badgeClassName}>{icon}</IconBadge>
      <span className="text-inherit no-underline">{text}</span>
    </div>
  );
}
