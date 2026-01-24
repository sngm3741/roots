import { useState } from "react";
import { Link2 } from "lucide-react";
import type { LinkItem } from "~/types/profile";
import { Col } from "~/components/atoms/Col";
import { Grid12 } from "~/components/atoms/Grid12";

type LinkCardProps = {
  link: LinkItem;
};

export function LinkCard({ link }: LinkCardProps) {
  const [isIconError, setIsIconError] = useState(false);
  const showIcon = Boolean(link.iconUrl) && !isIconError;
  const href = link.url ?? "";

  const content = (
    <div className="lilink-card block px-4 py-4 transition">
      <Grid12 gap="4">
        <Col span={2} smSpan={1}>
          <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-lilink-bg">
            {showIcon ? (
              <img
                src={link.iconUrl}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
                onError={() => setIsIconError(true)}
              />
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-xl lilink-chip text-lilink-accent">
                <Link2 className="h-4 w-4" />
              </div>
            )}
          </div>
        </Col>
        <Col span={10} smSpan={11}>
          <Grid12 gap="2">
            <Col span={12}>
              <Grid12 gap="1">
                {link.title ? (
                  <Col span={12}>
                    <span className="text-sm font-semibold text-lilink-ink">
                      {link.title}
                    </span>
                  </Col>
                ) : null}
                {link.description ? (
                  <Col span={12}>
                    <span className="lilink-link-description">
                      {link.description}
                    </span>
                  </Col>
                ) : null}
              </Grid12>
            </Col>
            {link.showUrl === false || !link.url ? null : (
              <Col span={12}>
                <span className="text-xs text-lilink-muted">{link.url}</span>
              </Col>
            )}
          </Grid12>
        </Col>
      </Grid12>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className="block">
      {content}
    </a>
  );
}

type ChildLinkCardProps = {
  link: LinkItem;
};

export function ChildLinkCard({ link }: ChildLinkCardProps) {
  const href = link.url ?? "";
  const content = (
    <div className="lilink-card lilink-subcard ml-16 block px-4 py-3">
      <Grid12 gap="2">
        <Col span={12}>
          <Grid12 gap="1">
            {link.title ? (
              <Col span={12}>
                <span className="text-xs font-semibold text-lilink-ink">
                  {link.title}
                </span>
              </Col>
            ) : null}
            {link.description ? (
              <Col span={12}>
                <span className="lilink-link-description is-child">
                  {link.description}
                </span>
              </Col>
            ) : null}
          </Grid12>
        </Col>
        {link.showUrl === false || !link.url ? null : (
          <Col span={12}>
            <span className="text-xs text-lilink-muted">{link.url}</span>
          </Col>
        )}
      </Grid12>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className="block">
      {content}
    </a>
  );
}
