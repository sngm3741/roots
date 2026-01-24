import type {
  CreatorSectionData,
  EventSectionData,
  GallerySectionData,
  OptionalSectionData,
  OptionalType,
  ProductSectionData,
} from "~/types/profile";
import { Col } from "~/components/atoms/Col";
import { Grid12 } from "~/components/atoms/Grid12";

type OptionalSectionProps = {
  type: OptionalType;
  data: OptionalSectionData;
};

const SECTION_LABEL: Record<OptionalType, string> = {
  event: "イベント",
  product: "商品",
  gallery: "ギャラリー",
  creator: "作品",
};

const SectionHeader = ({ title }: { title: string }) => (
  <Grid12 gap="2">
    <Col span={12}>
      <h2 className="text-sm font-semibold text-lilink-ink">{title}</h2>
    </Col>
  </Grid12>
);

const EventSection = ({ data }: { data: EventSectionData }) => (
  <Grid12 gap="3">
    {data.items.map((item) => (
      <Col key={item.id} span={12}>
        <Grid12 gap="2" className="lilink-card px-4 py-3">
          <Col span={12}>
            <div className="text-sm font-semibold text-lilink-ink">
              {item.title}
            </div>
          </Col>
          <Col span={12}>
            <div className="text-xs text-lilink-muted">{item.date}</div>
          </Col>
          {item.location ? (
            <Col span={12}>
              <div className="text-xs text-lilink-muted">{item.location}</div>
            </Col>
          ) : null}
        </Grid12>
      </Col>
    ))}
  </Grid12>
);

const ProductSection = ({ data }: { data: ProductSectionData }) => (
  <Grid12 gap="3">
    {data.items.map((item) => {
      const content = (
        <Grid12 gap="2" className="lilink-card px-4 py-3">
          <Col span={12}>
            <div className="text-sm font-semibold text-lilink-ink">
              {item.title}
            </div>
          </Col>
          {item.price ? (
            <Col span={12}>
              <div className="text-xs text-lilink-muted">{item.price}</div>
            </Col>
          ) : null}
        </Grid12>
      );

      return (
        <Col key={item.id} span={12}>
          {item.linkUrl ? (
            <a href={item.linkUrl} target="_blank" rel="noreferrer">
              {content}
            </a>
          ) : (
            content
          )}
        </Col>
      );
    })}
  </Grid12>
);

const GallerySection = ({ data }: { data: GallerySectionData }) => (
  <Grid12 gap="3">
    {data.items.map((item) => (
      <Col key={item.id} span={6}>
        <Grid12
          gap="2"
          className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_24px_rgba(30,41,59,0.08)]"
        >
          <Col span={12}>
            <img
              src={item.imageUrl}
              alt={item.caption ?? ""}
              loading="lazy"
              className="h-40 w-full object-cover"
            />
          </Col>
          {item.caption ? (
            <Col span={12}>
              <div className="px-3 py-2 text-xs text-lilink-muted">
                {item.caption}
              </div>
            </Col>
          ) : null}
        </Grid12>
      </Col>
    ))}
  </Grid12>
);

const CreatorSection = ({ data }: { data: CreatorSectionData }) => (
  <Grid12 gap="3">
    {data.items.map((item) => {
      const content = (
        <Grid12 gap="2" className="lilink-card px-4 py-3">
          <Col span={12}>
            <div className="text-sm font-semibold text-lilink-ink">
              {item.title}
            </div>
          </Col>
          {item.imageUrl ? (
            <Col span={12}>
              <img
                src={item.imageUrl}
                alt=""
                loading="lazy"
                className="mt-2 h-32 w-full rounded-xl object-cover"
              />
            </Col>
          ) : null}
        </Grid12>
      );

      return (
        <Col key={item.id} span={12}>
          {item.linkUrl ? (
            <a href={item.linkUrl} target="_blank" rel="noreferrer">
              {content}
            </a>
          ) : (
            content
          )}
        </Col>
      );
    })}
  </Grid12>
);

export function OptionalSection({ type, data }: OptionalSectionProps) {
  if (!data || data.items.length === 0) {
    return (
      <Grid12 gap="2" className="lilink-card px-4 py-4">
        <Col span={12}>
          <SectionHeader title={SECTION_LABEL[type]} />
        </Col>
        <Col span={12}>
          <p className="text-xs text-lilink-muted">
            まだコンテンツがありません。
          </p>
        </Col>
      </Grid12>
    );
  }

  return (
    <Grid12 gap="4">
      <Col span={12}>
        <SectionHeader title={SECTION_LABEL[type]} />
      </Col>
      {type === "event" ? (
        <Col span={12}>
          <EventSection data={data as EventSectionData} />
        </Col>
      ) : null}
      {type === "product" ? (
        <Col span={12}>
          <ProductSection data={data as ProductSectionData} />
        </Col>
      ) : null}
      {type === "gallery" ? (
        <Col span={12}>
          <GallerySection data={data as GallerySectionData} />
        </Col>
      ) : null}
      {type === "creator" ? (
        <Col span={12}>
          <CreatorSection data={data as CreatorSectionData} />
        </Col>
      ) : null}
    </Grid12>
  );
}
