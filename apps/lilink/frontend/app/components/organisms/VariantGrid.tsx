import { Fragment } from "react";
import { Grid12 } from "~/components/atoms/Grid12";
import { Variant } from "~/components/molecules/variant/Variant";
import type {
  VariantPattern,
  VariantPosition,
  VariantSize,
} from "~/components/molecules/variant/Variant";

export type VariantGridItem = {
  id: string;
  kind?: "profile" | "link";
  colStart?: number;
  colSpan?: number;
  rowSpan?: number;
  pattern?: VariantPattern;
  size?: VariantSize;
  position?: VariantPosition;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  url?: string;
  showUrl?: boolean;
};

type VariantGridProps = {
  items: VariantGridItem[];
  renderItemActions?: (item: VariantGridItem, index: number) => React.ReactNode;
  renderItemFooter?: (item: VariantGridItem, index: number) => React.ReactNode;
};

const clampColStart = (value?: number) =>
  Math.min(12, Math.max(1, value ?? 1));

const clampColSpan = (value: number | undefined, colStart: number) => {
  const span = Math.min(12, Math.max(1, value ?? 12));
  const maxSpan = 12 - colStart + 1;
  return Math.min(span, maxSpan);
};

const clampRowSpan = (value?: number) => (value && value >= 2 ? 2 : 1);

export function VariantGrid({
  items,
  renderItemActions,
  renderItemFooter,
}: VariantGridProps) {
  if (items.length === 0) {
    return (
      <Grid12 gap="2" className="lilink-card px-4 py-6 text-center">
        <div className="col-span-12 text-sm font-medium">
          まだ何もありません
        </div>
        <div className="col-span-12 text-xs text-lilink-muted">
          編集画面で追加できます。
        </div>
      </Grid12>
    );
  }

  return (
    <Grid12 gap="3">
      {items.map((item, index) => {
        const colStart = clampColStart(item.colStart);
        const colSpan = clampColSpan(item.colSpan, colStart);
        const rowSpan = clampRowSpan(item.rowSpan);
        const colEnd = Math.min(13, colStart + colSpan);
        const pattern = item.pattern ?? "primary";
        const size = item.size ?? "m";
        const position = item.position ?? "left";
        const showUrl = item.showUrl ?? false;
        const footerNode = renderItemFooter ? renderItemFooter(item, index) : null;

        return (
          <Fragment key={item.id}>
            <div
              style={{
                gridColumnStart: colStart,
                gridColumnEnd: colEnd,
                gridRowEnd: `span ${rowSpan}`,
              }}
              className="grid gap-3"
            >
              <div className="lilink-variant-shell">
                <Variant
                  pattern={pattern}
                  size={size}
                  position={position}
                  thumbnailUrl={item.thumbnailUrl}
                  title={item.title}
                  description={item.description}
                  url={item.url}
                  showUrl={showUrl}
                />
                {renderItemActions ? renderItemActions(item, index) : null}
              </div>
            </div>
            {footerNode ? (
              <div
                style={{ gridColumnStart: 1, gridColumnEnd: 13 }}
                className="grid"
              >
                {footerNode}
              </div>
            ) : null}
          </Fragment>
        );
      })}
    </Grid12>
  );
}
