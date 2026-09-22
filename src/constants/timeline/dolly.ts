/** Parámetros del dolly 3D y del carrusel móvil de la línea de tiempo. */

/** Profundidad (px) entre placas consecutivas a lo largo del eje Z. */
export const PASO_Z = 750;
/** Cuántas placas se ven "atrás" del foco antes de apagarse. */
export const ALCANCE = 2.5;
/** Cuántas placas "delante" del foco pasan rápido por la lente. */
export const PASO = 0.8;
/** Suavizado de la cámara (0 = instantáneo, 1 = no llega nunca). */
export const RESORTE = 0.16;
/** Suavizado de la cámara mientras el usuario arrastra el eje. */
export const RESORTE_ARRATRE = 0.3;
/** Umbral de quietud para mostrar el overlay de la placa enfocada. */
export const UMBRAL = 0.22;
/** Distancia mínima a la que la cámara se considera llegada. */
export const UMBRAL_QUIETUD = 0.0005;

/** Ancho de placa (px) por defecto cuando el CSS no define --placa-w. */
export const ANCHO_PLACA = 268;
/** Alto de placa = ancho * RATIO_PLACA (aspecto 4:5). */
export const RATIO_PLACA = 1.25;
/** Ancho (px) a partir del cual las placas se separan más del eje. */
export const ANCHO_SEPARACION_LATERAL = 300;
/** Separación lateral (fracción del ancho) para placas anchas. */
export const SEPARACION_LATERAL_ANCHA = 0.75;
/** Separación lateral (fracción del ancho) para placas angostas. */
export const SEPARACION_LATERAL_ESTRECHA = 0.18;
/** Desplazamiento horizontal (px) de la placa en su primer render. */
export const DESPLAZAMIENTO_X_INICIAL = 50;

/** Radio (placas) para apagar el color de las placas lejanas. */
export const GRIS_RADIO = 1.4;
/** Radio (placas) a partir del cual se atenda el brillo. */
export const BRILLO_RADIO = 2.5;
/** Atenuación máxima del brillo (0–1). */
export const BRILLO_ATENUADO = 0.18;
/** z-index base de la placa enfocada. */
export const Z_BASE = 500;
/** Caída de z-index por placa de distancia. */
export const Z_PENDIENTE = 150;
/** Distancia (placas) que cuenta como "enfocada" para los eventos. */
export const ENFOQUE_ESTRECHO = 0.6;
/** Opacidad mínima para que una placa reciba puntero. */
export const ENFOQUE_VISIBLE = 0.5;

/** Avance de la cámara por cada paso de rueda (½ placa). */
export const PASO_RUEDA = 0.5;
/** Separación (ms) mínima entre dos pasos de rueda. */
export const ESPERA_RUEDA = 380;
/** Desplazamiento (px) del puntero que convierte el toque en arrastre. */
export const UMBRAL_ARRATRE = 6;
/** Margen (px) inferior del escenario reservado al eje. */
export const MARGEN_EJE = 32;
/** Margen (px) superior del escenario hasta el inicio del eje. */
export const TOP_EJE = 16;
/** Tiempo (ms) que se ignora el click tras soltar un arrastre. */
export const BLOQUEO_CLIC_MS = 80;
/** Radio (px) del tap que abre el detalle en el carrusel móvil. */
export const UMBRAL_TAP = 8;
/** Hueco (px) entre placas del carrusel móvil (equivalente a gap 1rem). */
export const SEPARACION_MOVIL = 16;

/** Radio (placas) en el que la tarjeta de info se apaga por completo. */
export const INFO_RADIO = 0.3;
/** Visibilidad mínima de la tarjeta de info para mostrarla. */
export const INFO_UMBRAL = 0.15;