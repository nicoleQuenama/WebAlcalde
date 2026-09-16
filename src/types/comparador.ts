export interface ParComparador {
  titulo: string;
  antes: string;
  despues: string;
  afterFit?: 'cover' | 'contain' | 'fill' | 'none';
  afterPosition?: string;
  afterScale?: number;
}

export interface ComparadorProps {
  pares: ParComparador[];
}
