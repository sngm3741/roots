import type { OptionalSectionData, PageData, SocialKind } from "~/types/profile";
import {
  VariantGrid,
  type VariantGridItem,
} from "~/components/organisms/VariantGrid";
import { OptionalSection } from "~/components/organisms/OptionalSection";
import { Grid12 } from "~/components/atoms/Grid12";
import { Col } from "~/components/atoms/Col";
import { getSocialIconUrl } from "~/components/atoms/socialIcons";

type ProfilePageProps = {
  page: PageData;
  headerFooter?: React.ReactNode;
  linksHeader?: React.ReactNode;
  variantGridProps?: Omit<
    React.ComponentProps<typeof VariantGrid>,
    "items"
  >;
  isWide?: boolean;
};

export function ProfilePage({
  page,
  headerFooter,
  linksHeader,
  variantGridProps,
  isWide = false,
}: ProfilePageProps) {
  const { profile, links, optional } = page;
  const resolveSocialIconUrl = (link: {
    kind?: SocialKind;
    iconUrl?: string;
  }) => getSocialIconUrl(link.kind) ?? link.iconUrl ?? "";
  const backgroundImage = profile.backgroundImageUrl
    ? `url("${profile.backgroundImageUrl}")`
    : undefined;
  const hasBackgroundImage = Boolean(profile.backgroundImageUrl);
  const activeOptionalData = optional.type
    ? (optional.dataByType[optional.type] ??
        ({ items: [] } as OptionalSectionData))
    : null;
  const profileItem: VariantGridItem = {
    id: `profile-${profile.slug}`,
    kind: "profile",
    colStart: 1,
    colSpan: 12,
    rowSpan: 1,
    pattern: "profile",
    size: "m",
    position: "center",
    thumbnailUrl: profile.avatarUrl,
    title: profile.name,
    description: profile.subtitle,
    showUrl: false,
  };
  const socialLinks = profile.socialLinks ?? [];
  const socialItems: VariantGridItem[] = socialLinks.map(
    (link, index) => {
      const colSpan = 4;
      const colStart = (index % 3) * colSpan + 1;
      return {
        id: `social-${link.id}`,
        kind: "link" as const,
        colStart,
        colSpan,
        rowSpan: 1,
        pattern: "social",
        size: "s",
        position: "center",
        thumbnailUrl: resolveSocialIconUrl(link),
        title: link.label,
        description: link.description,
        url: link.url,
        showUrl: false,
      };
    },
  );
  const hasProfileContent =
    Boolean(profile.name?.trim()) ||
    Boolean(profile.subtitle?.trim()) ||
    Boolean(profile.avatarUrl?.trim());
  const linkItems: VariantGridItem[] = links.map((link) => ({
    ...link,
    kind: "link" as const,
    thumbnailUrl: link.iconUrl,
  }));

  return (
    <main
      className={`lilink-page min-h-screen px-6 pb-16 pt-12 ${
        hasBackgroundImage ? "" : "lilink-default-bg"
      }`}
      style={
        backgroundImage
          ? {
              backgroundImage,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
            }
          : undefined
      }
    >
      <div className={isWide ? "w-full" : "mx-auto w-full max-w-[375px]"}>
        <Grid12 gap="8">
          <Col
            span={12}
            start={1}
          >
            <Grid12 gap="8">
              <Col span={12}>
                <VariantGrid
                  items={
                    hasProfileContent
                      ? [profileItem, ...socialItems, ...linkItems]
                      : [...socialItems, ...linkItems]
                  }
                  {...variantGridProps}
                />
                {headerFooter ? (
                  <div className="mt-4">{headerFooter}</div>
                ) : null}
                {linksHeader ? (
                  <div className="mt-4">{linksHeader}</div>
                ) : null}
              </Col>
              {optional.enabled && optional.type && activeOptionalData ? (
                <Col span={12}>
                  <OptionalSection
                    type={optional.type}
                    data={activeOptionalData}
                  />
                </Col>
              ) : null}
            </Grid12>
          </Col>
        </Grid12>
      </div>
    </main>
  );
}
