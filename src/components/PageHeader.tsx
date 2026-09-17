interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}

export function PageHeader({ title, subtitle, eyebrow }: PageHeaderProps) {
  return (
    <div className="bg-navy-900 text-white py-10 sm:py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-400 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      </div>
      <div className="container-wide relative">
        {eyebrow && (
          <p className="text-gold-400 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2 sm:mb-3">
            {eyebrow}
          </p>
        )}
        <h1 className="text-white text-2xl sm:text-4xl md:text-5xl font-serif font-bold mb-3 sm:mb-4 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-navy-200 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
