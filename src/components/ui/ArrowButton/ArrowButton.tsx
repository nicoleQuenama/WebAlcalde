import type { ArrowDirection, ArrowVariant } from './ArrowButtonTypes';

export type { ArrowDirection, ArrowVariant };

interface Props {
  direction: ArrowDirection;
  variant?: ArrowVariant;
  onClick: (e?: React.MouseEvent) => void;
  'aria-label': string;
  className?: string;
}

const variantClasses: Record<ArrowVariant, string> = {
  hero: 'bg-white/20 hover:bg-white/40 backdrop-blur-md p-4 rounded-full text-white transition-transform hover:scale-110',
  modal: 'text-white/70 hover:text-white bg-black/20 hover:bg-black/50 rounded-full p-4 hover:scale-110 transition-all',
  comparison: 'flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white transition-transform hover:scale-110 sm:h-14 sm:w-14',
};

const svgSize: Record<ArrowVariant, number> = {
  hero: 24,
  modal: 40,
  comparison: 22,
};

const strokeWidth: Record<ArrowVariant, number> = {
  hero: 2.5,
  modal: 2,
  comparison: 2.5,
};

const leftPath = 'M15 19l-7-7 7-7';
const rightPath = 'M9 5l7 7-7 7';

export default function ArrowButton({
  direction,
  variant = 'hero',
  onClick,
  'aria-label': ariaLabel,
  className,
}: Props) {
  const size = svgSize[variant];
  const sw = strokeWidth[variant];
  const path = direction === 'left' ? leftPath : rightPath;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${variantClasses[variant]}${className ? ` ${className}` : ''}`}
    >
      <svg
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d={path} />
      </svg>
    </button>
  );
}
//crear carpeta para icons y volver escalable

