export type VariantPattern =
  | "hero"
  | "info"
  | "social"
  | "primary"
  | "child"
  | "profile";
export type VariantSize = "s" | "m" | "l";
export type VariantPosition = "left" | "center" | "right";

export type LinkItem = {
  id: string;
  title?: string;
  description?: string;
  url?: string;
  iconUrl?: string;
  showUrl?: boolean;
  colStart?: number;
  colSpan?: number;
  rowSpan?: number;
  pattern?: VariantPattern;
  size?: VariantSize;
  position?: VariantPosition;
};

export type SocialKind = "x" | "bluesky";

export type SocialLink = {
  id: string;
  kind: SocialKind;
  label?: string;
  description?: string;
  url: string;
  iconUrl?: string;
};

export type ProfileCore = {
  slug: string;
  name: string;
  subtitle?: string;
  avatarUrl: string;
  backgroundImageUrl?: string;
  chatbotEnabled?: boolean;
  socialLinks?: SocialLink[];
};

export type SectionKey = "links" | "optional";

export type OptionalType = "event" | "product" | "gallery" | "creator";

export type EventItem = {
  id: string;
  title: string;
  date: string;
  location?: string;
};

export type ProductItem = {
  id: string;
  title: string;
  price?: string;
  linkUrl?: string;
  imageUrl?: string;
};

export type GalleryItem = {
  id: string;
  imageUrl: string;
  caption?: string;
};

export type CreatorWork = {
  id: string;
  title: string;
  imageUrl?: string;
  linkUrl?: string;
};

export type EventSectionData = {
  items: EventItem[];
};

export type ProductSectionData = {
  items: ProductItem[];
};

export type GallerySectionData = {
  items: GalleryItem[];
};

export type CreatorSectionData = {
  items: CreatorWork[];
};

export type OptionalSectionData =
  | EventSectionData
  | ProductSectionData
  | GallerySectionData
  | CreatorSectionData;

export type OptionalDataByType = {
  event?: EventSectionData;
  product?: ProductSectionData;
  gallery?: GallerySectionData;
  creator?: CreatorSectionData;
};

export type OptionalSection = {
  type: OptionalType | null;
  enabled: boolean;
  dataByType: OptionalDataByType;
};

export type PageData = {
  profile: ProfileCore;
  links: LinkItem[];
  optional: OptionalSection;
};
