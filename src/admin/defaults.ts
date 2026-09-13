/**
 * Valores por defecto del contenido que hoy vive hardcodeado en las páginas
 * (no en `src/lib/db.ts`). Es la ÚNICA fuente de verdad para ese texto: tanto
 * las páginas reales (`index.astro`, etc.) como el editor CMS (`/admin/[secret]`)
 * importan de acá, para que no se puedan desincronizar.
 */

export const DEFAULT_HOME_HERO = {
  eyebrow: 'Cocha, la mejor ciudad de Bolivia',
  titulo: 'Manfred Reyes Villa',
};

export const DEFAULT_HOME_ANTES_DESPUES = {
  kicker: 'Antes y después',
  titulo: 'De una ciudad de ayer a una que mira al futuro',
  parrafo: 'Desliza el tirador para comparar cada punto; usa las flechas para pasar al siguiente.',
};

export const DEFAULT_HOME_BIOGRAFIA = {
  eyebrow: 'Manfred Reyes Villa',
  titulo: 'Biografía',
  parrafo:
    'Manfred Reyes Villa es un líder político boliviano con una trayectoria dedicada al desarrollo ' +
    'de Cochabamba. Con experiencia en gestión pública y un compromiso inquebrantable con el ' +
    'progreso de su ciudad, ha impulsado proyectos fundamentales que transforman la vida de los ' +
    'cochabambinos.',
  cta1Label: 'Más sobre mí',
  cta1Href: '/sobre',
  cta2Label: 'Gestión completa',
  cta2Href: '/gestion',
};

export const DEFAULT_FLIPBOOK_META = {
  kicker: 'El libro digital',
  parrafo:
    'Un recorrido en imágenes por las obras que transformaron Cochabamba, de los años 90 a ' +
    'la gestión 2021–2026. Ábrelo y hojéalo página por página, con fotos y videos.',
  title: 'Cocha, la mejor ciudad de Bolivia',
  subtitle: 'Las obras, los servicios y la gestión de la ciudad, contadas como un álbum.',
  ctaLabel: 'Abrir libro',
  coverImage: '/cocha.jpg',
  coverBadge: 'Libro digital',
  coverTitle: 'Cocha,\nla mejor ciudad de Bolivia',
  coverSubtitle: 'De los años 90 a la gestión 2021 — 2026',
  coverLabel3D: 'Cocha,\nla mejor ciudad\nde Bolivia',
  backTitle: 'Fin',
  backText: 'Cochabamba, una ciudad que vuelve a soñar en grande.',
  antesDespuesCaption: 'Fotografías comparativas a través de los años — imágenes de referencia.',
};

export const DEFAULT_SOBRE_HERO = {
  eyebrow: 'Biografía y trayectoria',
  titulo: 'Manfred Reyes Villa',
  quote: 'Una vida dedicada a Cochabamba',
};

/** El párrafo real sale de `getCapitulos()` (capítulo "presentación"); acá solo lo fijo/editable. */
export const DEFAULT_SOBRE_BIOGRAFIA = {
  eyebrow: 'Biografía',
  titulo: 'Una vida dedicada a Cochabamba',
  ctaLabel: 'Ver la gestión completa',
  ctaHref: '/gestion#presentacion',
};

export const DEFAULT_HOME_LAYOUT = ['hero', 'biografia', 'antes_despues', 'libro'];
export const DEFAULT_GESTION_LAYOUT = ['hero', 'capitulos', 'eras', 'proyectos_titulo', 'proyectos'];
export const DEFAULT_SOBRE_LAYOUT = ['hero', 'biografia', 'institutional', 'timeline'];
