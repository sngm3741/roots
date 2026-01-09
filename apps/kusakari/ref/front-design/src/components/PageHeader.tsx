interface PageHeaderProps {
  title: string;
  subtitle: string;
  description?: string;
}

export function PageHeader({ title, subtitle, description }: PageHeaderProps) {
  return (
    <div className="relative bg-gradient-to-br from-emerald-50 to-white pt-32 pb-16 lg:pt-40 lg:pb-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center">
          <p className="text-emerald-600 font-bold text-lg mb-3">{subtitle}</p>
          <h1 className="text-4xl lg:text-5xl text-gray-900 mb-4">{title}</h1>
          {description && (
            <p className="text-lg text-gray-700 mt-6 max-w-3xl mx-auto">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
