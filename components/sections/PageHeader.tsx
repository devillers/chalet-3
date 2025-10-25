interface PageHeaderProps {
  title: string;
  description?: string;
  imageUrl?: string;
}

export default function PageHeader({
  title,
  description,
  imageUrl = 'https://images.pexels.com/photos/358636/pexels-photo-358636.jpeg?auto=compress&cs=tinysrgb&w=1920'
}: PageHeaderProps) {
  return (
    <div className="relative h-[320px] sm:h-[380px] lg:h-[420px] w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900/80" />
      </div>

      <div className="relative h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-lg sm:text-xl text-slate-100 max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

    
    </div>
  );
}
