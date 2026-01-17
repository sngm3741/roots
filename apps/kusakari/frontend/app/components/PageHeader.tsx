interface PageHeaderProps {
  title: string;
  subtitle: string;
  description?: string;
  backgroundImage?: string;
}

export function PageHeader({ title, subtitle, description, backgroundImage }: PageHeaderProps) {
  const textShadow = "0 2px 0 rgba(0,0,0,0.35), 0 8px 16px rgba(0,0,0,0.45)";

  return (
    <div
      className={[
        "relative overflow-hidden pt-32 pb-16 lg:pt-40 lg:pb-20",
        backgroundImage ? "" : "bg-gradient-to-br from-emerald-50 to-white",
      ].join(" ")}
    >
      {backgroundImage ? (
        <>
          <img
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
        </>
      ) : null}
      <div className="container mx-auto px-4 sm:px-6">
        <div className="relative z-10 text-center">
          <p
            className="text-emerald-100 font-extrabold text-lg mb-3"
            style={{ textShadow }}
          >
            {subtitle}
          </p>
          <h1
            className="text-4xl lg:text-5xl text-white mb-4 font-extrabold tracking-wide"
            style={{ textShadow }}
          >
            {title}
          </h1>
          {description ? (
            <p
              className="text-lg text-emerald-50/90 mt-6 max-w-3xl mx-auto font-semibold"
              style={{ textShadow }}
            >
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
