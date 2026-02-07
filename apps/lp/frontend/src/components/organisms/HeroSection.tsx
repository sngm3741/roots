import { useEffect, useState } from "react";
import HeroAvatar from "../molecules/HeroAvatar";
import ContactList from "../molecules/ContactList";
import { profile } from "../../data/profile";
import { contactItems } from "../../data/contacts";
import NarrowSection from "../molecules/NarrowSection";

export default function HeroSection() {
  const [status, setStatus] = useState<"online" | "offline" | "sleep">("online");

  useEffect(() => {
    const timer = setInterval(() => {
      setStatus((prev) => {
        if (prev === "online") return "offline";
        if (prev === "offline") return "sleep";
        return "online";
      });
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
      <NarrowSection className="pb-6 pt-12" containerClassName="text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-center">
          <HeroAvatar status={status} imageUrl={profile.imageUrl} alt={profile.imageAlt} />
        </div>

        <div className="my-5 text-center">
          <h1 className="text-display tracking-wide">
            <span className="text-slate-900 dark:text-slate-100">{profile.companyName}</span>
          </h1>
          <p className="text-body text-slate-400 dark:text-slate-200">{profile.domain}</p>
          <ContactList items={contactItems} />
        </div>
    </NarrowSection>
  );
}
