import { Col } from "~/components/atoms/Col";
import { Grid12 } from "~/components/atoms/Grid12";

export type VariantPattern =
  | "hero"
  | "info"
  | "social"
  | "primary"
  | "child"
  | "profile";
export type VariantSize = "s" | "m" | "l";
export type VariantPosition = "left" | "center" | "right";

type VariantProps = {
  pattern: VariantPattern;
  size?: VariantSize;
  position?: VariantPosition;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  url?: string;
  showUrl?: boolean;
  className?: string;
};

const sizeClassMap: Record<VariantSize, string> = {
  s: "text-xs",
  m: "text-sm",
  l: "text-base",
};

const positionClassMap: Record<VariantPosition, string> = {
  left: "text-left justify-items-start",
  center: "text-center justify-items-center",
  right: "text-right justify-items-end",
};

const patternStyleMap: Record<
  VariantPattern,
  {
    wrapper: string;
    title: string;
    description: string;
    url: string;
    isSocial?: boolean;
    isProfile?: boolean;
  }
> = {
  hero: {
    wrapper:
      "rounded-[28px] bg-white/80 p-6 shadow-[0_20px_50px_rgba(31,42,51,0.12)]",
    title: "text-xl font-semibold text-lilink-ink",
    description: "text-sm text-lilink-muted",
    url: "text-[10px] text-lilink-muted",
  },
  info: {
    wrapper:
      "rounded-[22px] bg-white/90 p-5 shadow-[0_14px_32px_rgba(31,42,51,0.1)]",
    title: "text-base font-semibold text-lilink-ink",
    description: "text-sm text-lilink-muted",
    url: "text-[10px] text-lilink-muted",
  },
  social: {
    wrapper:
      "aspect-square w-24 items-center justify-center rounded-3xl bg-white/90 p-3 shadow-[0_12px_28px_rgba(31,42,51,0.08)]",
    title: "text-[11px] font-semibold text-lilink-ink",
    description: "text-[10px] text-lilink-muted",
    url: "text-[9px] text-lilink-muted",
    isSocial: true,
  },
  profile: {
    wrapper:
      "rounded-[28px] bg-transparent p-0 shadow-none",
    title: "text-base font-semibold text-lilink-ink",
    description: "text-sm text-lilink-muted",
    url: "text-[10px] text-lilink-muted",
    isProfile: true,
  },
  primary: {
    wrapper:
      "rounded-[24px] border border-lilink-border bg-white/95 p-5 shadow-[0_16px_36px_rgba(31,42,51,0.1)]",
    title: "text-base font-semibold text-lilink-ink",
    description: "text-sm text-lilink-muted",
    url: "text-[10px] text-lilink-muted",
  },
  child: {
    wrapper:
      "rounded-[18px] border border-lilink-border bg-white/90 p-4 shadow-[0_10px_24px_rgba(31,42,51,0.08)]",
    title: "text-sm font-semibold text-lilink-ink",
    description: "text-xs text-lilink-muted",
    url: "text-[10px] text-lilink-muted",
  },
};

const renderThumbnail = (
  thumbnailUrl?: string,
  isSocial?: boolean,
  isProfile?: boolean,
) => {
  if (!thumbnailUrl) {
    return null;
  }

  if (isSocial) {
    return (
      <div className="grid h-10 w-10 place-items-center rounded-2xl shadow-[0_10px_20px_rgba(31,42,51,0.12)]">
        <img
          src={thumbnailUrl}
          alt=""
          className="h-8 w-8 rounded-full object-contain"
          loading="lazy"
        />
      </div>
    );
  }

  if (isProfile) {
    return (
      <div className="grid h-36 w-36 place-items-center overflow-hidden rounded-full bg-lilink-bg shadow-[0_12px_24px_rgba(31,42,51,0.16)]">
        <img
          src={thumbnailUrl}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-lilink-bg">
      <img
        src={thumbnailUrl}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
};

export function Variant({
  pattern,
  size = "m",
  position = "left",
  thumbnailUrl,
  title,
  description,
  url,
  showUrl = true,
  className,
}: VariantProps) {
  const styles = patternStyleMap[pattern];
  const isLink = Boolean(url);
  const content = (
    <Grid12
      gap="2"
      className={[
        "grid",
        styles.isProfile ? "overflow-visible" : "",
        sizeClassMap[size],
        positionClassMap[position],
        styles.wrapper,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {styles.isSocial ? (
        <Col span={12} className="grid place-items-center gap-2">
          {renderThumbnail(thumbnailUrl, styles.isSocial)}
          {title ? <div className={styles.title}>{title}</div> : null}
          {description ? (
            <div className={styles.description}>{description}</div>
          ) : null}
        </Col>
      ) : styles.isProfile ? (
        <Col span={12} className="grid place-items-center gap-3 text-center">
          {renderThumbnail(thumbnailUrl, false, styles.isProfile)}
          <div className="grid gap-1 rounded-[22px] bg-white/90 px-5 py-3 shadow-[0_16px_36px_rgba(31,42,51,0.12)]">
            {title ? <div className={styles.title}>{title}</div> : null}
            {description ? (
              <div className={styles.description}>{description}</div>
            ) : null}
          </div>
        </Col>
      ) : (
        <Col span={12}>
          <Grid12 gap="3" className="items-start">
            {thumbnailUrl ? (
              <Col span={2} smSpan={1}>
                {renderThumbnail(thumbnailUrl, styles.isSocial)}
              </Col>
            ) : null}
            <Col span={thumbnailUrl ? 10 : 12} smSpan={thumbnailUrl ? 11 : 12}>
              <Grid12 gap="1">
                {title ? (
                  <Col span={12}>
                    <div className={styles.title}>{title}</div>
                  </Col>
                ) : null}
                {description ? (
                  <Col span={12}>
                    <div className={styles.description}>{description}</div>
                  </Col>
                ) : null}
              </Grid12>
            </Col>
          </Grid12>
        </Col>
      )}
      {url && showUrl ? (
        <Col span={12}>
          <span className={`break-all ${styles.url}`}>{url}</span>
        </Col>
      ) : null}
    </Grid12>
  );

  if (!isLink) {
    return content;
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className="block">
      {content}
    </a>
  );
}
