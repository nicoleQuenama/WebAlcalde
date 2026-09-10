/**
 * VideoPlayer.tsx — Componente para reproducir videos de biografía.
 *
 * Recibe las props {src, poster, title, description}.
 */

interface VideoPlayerProps {
  /** URL del video */
  src: string;
  /** URL del poster/imagen previa */
  poster: string;
  /** Título del video */
  title?: string;
  /** Descripción del video */
  description?: string;
  /** Clases CSS adicionales */
  className?: string;
}

export default function VideoPlayer({
  src,
  poster,
  title,
  description,
  className = '',
}: VideoPlayerProps) {
  return (
    <figure className={`overflow-hidden rounded-2xl border border-slate-200 ${className}`}>
      <video
        className="aspect-video bg-slate-900 object-cover object-[50%_7%]"
        src={src}
        poster={poster}
        controls
        preload="metadata"
        playsInline
      ></video>
      {(title || description) && (
        <figcaption className="bg-slate-50 px-4 py-2 text-xs font-medium italic text-slate-400">
          {title && <span className="font-semibold">{title}</span>}
          {title && description && ' — '}
          {description}
        </figcaption>
      )}
    </figure>
  );
}
