export type Encuadre = 'rostro' | 'centro' | 'norte' | 'tronco';

export interface AjusteCarrusel {
  objectFit?: 'cover' | 'contain';
  objectPosition?: string;
  /** Zoom visual (scale). Se ancla al centro de la card, igual que el playground. */
  scale?: number;
}

export interface FotoAjustable {
  encuadre?: Encuadre;
  zoomOut?: boolean;
  ajuste?: AjusteCarrusel;
}

/** Estilos CSS aplicables a un <img> dentro de un marco con overflow oculto. */
export function ajusteImagen(img?: FotoAjustable): {
  objectFit: string;
  objectPosition: string;
  transform?: string;
} {
  if (!img) return { objectFit: 'cover', objectPosition: '50% 30%', transform: undefined };
  if (img.ajuste) {
    return {
      objectFit: img.ajuste.objectFit ?? 'cover',
      objectPosition: img.ajuste.objectPosition ?? '50% 7%',
      transform: img.ajuste.scale != null ? `scale(${img.ajuste.scale})` : undefined,
    };
  }
  const base = img.encuadre === 'tronco' ? '18%' : img.encuadre === 'centro' ? '50%' : img.encuadre === 'norte' ? '2%' : '7%';
  const pos = img.zoomOut ? `50% ${Math.min(parseFloat(base) + 11, 50)}%` : `50% ${base}`;
  return { objectFit: 'cover', objectPosition: pos, transform: undefined };
}