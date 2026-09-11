interface InstitutionalCard {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
}

export const INSTITUTIONAL_CARDS: InstitutionalCard[] = [
  {
    id: 'bio',
    eyebrow: '01 · Biografía',
    title: 'Biografía',
    body: 'Trayectoria de servicio y compromiso con Cochabamba: gestión pública, trabajo constante y cercanía con la gente.',
  },
  {
    id: 'mision',
    eyebrow: '02 · Misión',
    title: 'Misión',
    body: 'Trabajar todos los días por una ciudad ordenada, moderna e inclusiva, poniendo los recursos al servicio de las familias.',
  },
  {
    id: 'vision',
    eyebrow: '03 · Visión',
    title: 'Visión',
    body: 'Construir un Cochabamba próspero y sostenible, donde el desarrollo llegue a cada barrio y cada persona tenga oportunidades.',
  },
];