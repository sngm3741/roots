export type SocialKind = "x" | "bluesky" | "instagram" | "line" | "youtube" | "website";

export type SocialLink = {
  id: string;
  kind: SocialKind;
  url: string;
  handle?: string;
  description: string;
};

export type LinkItem = {
  id: string;
  title?: string;
  description: string;
  url: string;
  iconUrl?: string;
};

export type Profile = {
  slug: string;
  name: string;
  subtitle?: string;
  avatarUrl: string;
  backgroundImageUrl?: string;
  chatbotEnabled?: boolean;
  socialLinks: SocialLink[];
  links: LinkItem[];
};
