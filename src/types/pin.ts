export interface PinDatos {
  nombre: string;
  coords: [number, number];
  descripcion?: string;
  imagenes: string[];
}

export interface PinPanelProps {
  pin: PinDatos;
  onCerrar: () => void;
}
