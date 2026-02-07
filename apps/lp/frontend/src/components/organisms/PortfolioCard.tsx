import { Link2 } from "lucide-react";
import type { PortfolioItem } from "../../data/portfolio";
import PortfolioCostGrid from "../molecules/PortfolioCostGrid";
import PortfolioImage from "../molecules/PortfolioImage";
import PortfolioTechList from "../molecules/PortfolioTechList";

type PortfolioCardProps = {
  item: PortfolioItem;
};

export default function PortfolioCard({ item }: PortfolioCardProps) {
  return (
    <div className="card-content">
      <PortfolioImage image={item.image} title={item.title} />
      <div className="space-y-2">
        {item.role && (
          <p className="text-caption font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-400">
            {item.role}
          </p>
        )}
        <h5 className="card-title text-base">{item.title}</h5>
        <p className="card-description">{item.description}</p>
      </div>
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-300"
        >
          <Link2 size={12} aria-hidden="true" />
          {item.url}
        </a>
      )}
      <PortfolioTechList tech={item.tech} />
      <PortfolioCostGrid
        devCost={item.devCost}
        opsCost={item.opsCost}
        delivery={item.delivery}
        other={item.other}
      />
    </div>
  );
}
