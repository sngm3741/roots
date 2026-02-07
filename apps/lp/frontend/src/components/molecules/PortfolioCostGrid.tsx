import { useI18n } from "../../contexts/I18nContext";

type PortfolioCostGridProps = {
  devCost: string;
  opsCost: string;
  delivery: string;
  other: string;
};

export default function PortfolioCostGrid({
  devCost,
  opsCost,
  delivery,
  other,
}: PortfolioCostGridProps) {
  const { t } = useI18n();
  return (
    <div className="mt-4 w-full space-y-2 text-body-sm text-slate-600 dark:text-slate-300">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium text-slate-500 dark:text-slate-400">
          {t("portfolio.cost.dev")}
        </span>
        <span className="font-semibold text-slate-700 dark:text-slate-100">{devCost}</span>
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium text-slate-500 dark:text-slate-400">
          {t("portfolio.cost.ops")}
        </span>
        <span className="font-semibold text-slate-700 dark:text-slate-100">{opsCost}</span>
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium text-slate-500 dark:text-slate-400">
          {t("portfolio.cost.delivery")}
        </span>
        <span className="font-semibold text-slate-700 dark:text-slate-100">
          {delivery}
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium text-slate-500 dark:text-slate-400">
          {t("portfolio.cost.other")}
        </span>
        <span className="font-semibold text-slate-700 dark:text-slate-100">{other}</span>
      </div>
    </div>
  );
}
