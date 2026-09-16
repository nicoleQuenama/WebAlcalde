export const placeholderFoto = (nombre: string, i: number): string => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">` +
    `<rect width="100%" height="100%" fill="#2e1065"/>` +
    `<circle cx="50%" cy="42%" r="44" fill="#6e48be" opacity="0.45"/>` +
    `<text x="50%" y="62%" fill="#fff" opacity="0.9" font-family="Arial,sans-serif" font-size="44" font-weight="700" text-anchor="middle">${nombre}</text>` +
    `<text x="50%" y="70%" fill="#fff" opacity="0.5" font-family="Arial,sans-serif" font-size="18" text-anchor="middle">Foto ${i + 1} — imagen de referencia</text>` +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const fotosDe = (nombre: string, cantidad = 3): string[] =>
  Array.from({ length: cantidad }, (_, i) => placeholderFoto(nombre, i));
