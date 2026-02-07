import type { ReactNode } from "react";
import { Mail, MapPin, Phone, User } from "lucide-react";
import { profile } from "./profile";

export type ContactItem = {
  key: string;
  icon: ReactNode;
  text: ReactNode;
  badgeClassName?: string;
};

export const contactItems: ContactItem[] = [
  {
    key: "name",
    icon: <User size={14} aria-hidden="true" />,
    text: profile.displayName,
  },
  {
    key: "phone",
    icon: <Phone size={14} aria-hidden="true" />,
    text: (
      <a className="text-inherit no-underline" href="tel:09063349093">
        09063349093
      </a>
    ),
  },
  {
    key: "email",
    icon: <Mail size={14} aria-hidden="true" />,
    text: "info@yotsuya-it.com",
  },
  {
    key: "address",
    icon: <MapPin size={14} aria-hidden="true" />,
    text: "東京都新宿区",
  },
  {
    key: "tax",
    icon: <span className="text-[12px] font-semibold">T</span>,
    text: "T4283549882124",
    badgeClassName: "text-[12px] font-semibold text-blue-700",
  },
];
