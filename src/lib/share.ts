/**
 * Comparte contenido con la Web Share API del navegador.
 * Si no existe, copia la URL actual al portapapeles como fallback.
 * Los fallos se ignoran a propósito (p. ej. el usuario cierra el diálogo nativo).
 */
export async function compartir({
  title,
  text,
}: {
  title: string;
  text: string;
}): Promise<void> {
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
    } catch {}
  } else {
    try {
      await navigator.clipboard.writeText(url);
    } catch {}
  }
}
