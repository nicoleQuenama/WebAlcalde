import styles from './Book.module.css';
import { createClasses } from '@lib/book3D';
import { REVEAL_EFFECT } from '@constants/book/book3D';
import type { IMG } from '@types/book3D';

/** Cómo se enmarca la foto dentro de la página. */
export type FigureVariant = 'portrait' | 'context';

/** Clase CSS concreta de cada variante (definida en `Book.module.css`). */
const CLASS_BY_VARIANT: Record<FigureVariant, string> = {
  portrait: 'mediaPortrait',
  context: 'mediaFeature',
};

/**
 * Foto expandible de una página de libro: retrato del alcalde (`portrait`, a
 * tamaño completo) o escena de contexto (`context`). Ambas comparten el mismo
 * marcado y el `data-expand` que el FlipBook usa para abrir la media.
 */
export default function FigurePhoto({
  photo,
  variant,
}: {
  photo?: IMG;
  variant: FigureVariant;
}) {
  if (!photo) return null;
  const s = createClasses(styles);
  return (
    <figure className={s(CLASS_BY_VARIANT[variant])} data-reveal={REVEAL_EFFECT.ZOOM}>
      <img
        data-expand
        data-url={photo.src}
        data-alt={photo.alt}
        src={photo.src}
        alt={photo.alt}
        loading="lazy"
      />
    </figure>
  );
}