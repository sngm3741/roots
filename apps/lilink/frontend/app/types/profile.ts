export type SocialKind = "x" | "instagram" | "line" | "youtube" | "website";

export type SocialLink = {
  kind: SocialKind;
  url: string;
};

export type LinkItem = {
  id: string;
  title: string;
  url: string;
  iconUrl?: string;
};

export type Profile = {
  slug: string;
  name: string;
  subtitle?: string;
  avatarUrl: string;
  socialLinks: SocialLink[];
  links: LinkItem[];
};
