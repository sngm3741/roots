import { Link } from "react-router";

interface ContactCtaCardProps {
  title: string;
  description: string;
  ctaLabel: string;
  ctaLink: string;
}

export function ContactCtaCard({
  title,
  description,
  ctaLabel,
  ctaLink,
}: ContactCtaCardProps) {
  return (
    <div className="text-center bg-white border-2 border-emerald-200 p-10 rounded-xl max-w-3xl mx-auto">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-700 mb-6">{description}</p>
      <Link
        to={ctaLink}
        className="bg-emerald-600 text-white px-8 py-4 rounded-lg hover:bg-emerald-700 transition-colors font-bold text-lg"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
