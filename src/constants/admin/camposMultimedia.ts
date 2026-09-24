/**
 * Nombres de campo del editor CMS que disparan sincronización de
 * imagen/video en la vista previa. Único origen: lo usan `previewSync`
 * (sincronizar DOM del iframe) y el handler de mensajes del editor.
 * Agregar un campo multimedia nuevo es tocar este archivo en un solo lugar.
 */

export const CAMPOS_IMG_BLOQUE = new Set(['imagen', 'coverImage', 'src']);
export const CAMPOS_IMG_SECCION = new Set(['imagen', 'coverImage']);
export const CAMPOS_VIDEO = new Set(['video', 'src']);

/** Cualquier campo que implique media (imagen, video o póster). */
export const CAMPOS_MULTIMEDIA = new Set([...CAMPOS_IMG_BLOQUE, ...CAMPOS_VIDEO, 'poster']);