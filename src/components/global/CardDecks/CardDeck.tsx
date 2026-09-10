
interface CardDeckProps {
  image: string;
  content: string;
  title?: string;
  isActive?: boolean;
  className?: string;
}

export default function CardDeck({
  image,
  content,
  title,
  isActive = false,
  className = '',
}: CardDeckProps) {
  return (
    <div
      className={`shrink-0 overflow-hidden rounded-2xl border transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isActive
          ? 'scale-100 border-[rgb(var(--color-primary-rgb)/0.3)] opacity-100 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)]'
          : 'scale-95 border-slate-200 opacity-70'
      } ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title ?? content}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {title && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        )}
        {title && (
          <span className="absolute bottom-3 left-3 right-3 text-sm font-semibold text-white">
            {title}
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="text-sm leading-relaxed text-slate-600 line-clamp-3">
          {content}
        </p>
      </div>
    </div>
  );
}