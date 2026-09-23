/**
 * Colores del shell del editor CMS. La página del editor (`/admin/[secret]`)
 * NO carga `global.css` (solo `admin-cms.css`), así que los estilos inline del
 * editor usan literales en lugar de `var(--color-*)`. Estos valores replican
 * los tokens de `@theme` en `src/styles/global.css` — único lugar del admin
 * donde se definen, para no esparcir hex por el código.
 */

export const COLOR_PRIMARY = '#472d82';
export const COLOR_ACCENT = '#c9b8e8';
export const COLOR_ACCENT_SOFT = '#f3efff';
export const COLOR_PANEL_SOFT = '#faf8ff';
export const COLOR_BLANCO = '#ffffff';
export const COLOR_TEXTO = '#241a3a';
export const COLOR_TEXTO_SUAVE = '#6b5f87';
export const COLOR_BORDE_CLARO = '#e3dbf5';