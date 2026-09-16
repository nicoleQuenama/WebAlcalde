import type { PinDatos } from '../../types/pin';
import { fotosDe } from '@lib/map/placeholder';

export const PINES: PinDatos[] = [
  {
    nombre: 'Cala Cala',
    coords: [-17.381543, -66.160042],
    descripcion: 'Barrio emblemático de la ciudad.',
    imagenes: fotosDe('Cala Cala'),
  },
  {
    nombre: 'Estadio',
    coords: [-17.379086, -66.161564],
    descripcion: 'Complejo deportivo del municipio.',
    imagenes: fotosDe('Estadio'),
  },
  {
    nombre: 'Melchor',
    coords: [-17.393571, -66.180374],
    descripcion: 'Zona de servicios y vías de acceso.',
    imagenes: fotosDe('Melchor'),
  },
];
