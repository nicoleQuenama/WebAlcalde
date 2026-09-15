import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './Map.module.css';
import PinPanel from './PinPanel';
import type { PinDatos } from './PinPanel';

/**
 * Polígono del municipio de Cochabamba (Provincia Cercado).
 * Se genera escalando linealmente el SVG que la alcaldía usa para delimitar el Cercado
 * (viewBox "-24 -73 494 898", puntos x:95-402, y:103-521) sobre el bounding box real
 * del municipio (OSM/AMDECO): lat -17.534055..-17.278124, lon -66.280267..-66.067174.
 */
const CERCADO: [number, number][] = [
  [-17.508952, -66.110903],
  [-17.512013, -66.116456],
  [-17.515074, -66.119233],
  [-17.515074, -66.12548],
  [-17.516299, -66.126174],
  [-17.518136, -66.131032],
  [-17.516299, -66.141444],
  [-17.517524, -66.143527],
  [-17.522422, -66.145609],
  [-17.529157, -66.153244],
  [-17.529769, -66.159491],
  [-17.528545, -66.160879],
  [-17.534055, -66.166432],
  [-17.528545, -66.174762],
  [-17.526095, -66.182397],
  [-17.521197, -66.190032],
  [-17.515687, -66.194891],
  [-17.507727, -66.197667],
  [-17.506503, -66.200444],
  [-17.507727, -66.230985],
  [-17.509564, -66.237232],
  [-17.508339, -66.242785],
  [-17.504666, -66.25042],
  [-17.502829, -66.251114],
  [-17.502217, -66.253197],
  [-17.495482, -66.255973],
  [-17.489971, -66.264302],
  [-17.483236, -66.268467],
  [-17.47895, -66.273326],
  [-17.466705, -66.280267],
  [-17.458745, -66.255973],
  [-17.45201, -66.253891],
  [-17.445275, -66.245561],
  [-17.426295, -66.243479],
  [-17.422009, -66.240703],
  [-17.422009, -66.23515],
  [-17.423233, -66.233761],
  [-17.422009, -66.230985],
  [-17.422621, -66.226126],
  [-17.421396, -66.222656],
  [-17.418947, -66.221267],
  [-17.41956, -66.219879],
  [-17.418335, -66.218491],
  [-17.412212, -66.218491],
  [-17.410988, -66.21502],
  [-17.408539, -66.213632],
  [-17.406702, -66.207385],
  [-17.394456, -66.207385],
  [-17.382823, -66.205997],
  [-17.384048, -66.203914],
  [-17.375476, -66.201138],
  [-17.368741, -66.201832],
  [-17.364455, -66.200444],
  [-17.356495, -66.194891],
  [-17.351597, -66.192809],
  [-17.341188, -66.182397],
  [-17.332004, -66.178232],
  [-17.327718, -66.174068],
  [-17.320983, -66.171985],
  [-17.318534, -66.172679],
  [-17.316085, -66.171291],
  [-17.311799, -66.171985],
  [-17.305064, -66.167821],
  [-17.293431, -66.163656],
  [-17.28792, -66.149079],
  [-17.286696, -66.147691],
  [-17.279961, -66.146303],
  [-17.279961, -66.141444],
  [-17.278124, -66.140056],
  [-17.279349, -66.135891],
  [-17.28241, -66.133115],
  [-17.283022, -66.131032],
  [-17.289145, -66.129644],
  [-17.294655, -66.123397],
  [-17.299554, -66.121315],
  [-17.302003, -66.11715],
  [-17.305064, -66.11715],
  [-17.311799, -66.122703],
  [-17.319759, -66.123397],
  [-17.326494, -66.121315],
  [-17.33629, -66.116456],
  [-17.339964, -66.116456],
  [-17.342413, -66.114374],
  [-17.350985, -66.117844],
  [-17.356495, -66.11715],
  [-17.363843, -66.11368],
  [-17.369965, -66.10535],
  [-17.37119, -66.106044],
  [-17.374251, -66.103268],
  [-17.3767, -66.103268],
  [-17.385272, -66.108127],
  [-17.390783, -66.11368],
  [-17.392619, -66.118538],
  [-17.392619, -66.122703],
  [-17.395069, -66.124785],
  [-17.396293, -66.130338],
  [-17.398742, -66.12895],
  [-17.403028, -66.123397],
  [-17.410375, -66.119927],
  [-17.410988, -66.118538],
  [-17.41956, -66.115068],
  [-17.421396, -66.115762],
  [-17.423233, -66.114374],
  [-17.424458, -66.109515],
  [-17.429356, -66.103962],
  [-17.434254, -66.10188],
  [-17.435479, -66.099103],
  [-17.43854, -66.099797],
  [-17.442214, -66.097021],
  [-17.441601, -66.092856],
  [-17.443438, -66.09008],
  [-17.450786, -66.084527],
  [-17.453847, -66.084527],
  [-17.458745, -66.08175],
  [-17.458745, -66.080362],
  [-17.461807, -66.078974],
  [-17.461807, -66.077586],
  [-17.463643, -66.075503],
  [-17.466092, -66.075503],
  [-17.466092, -66.072727],
  [-17.467317, -66.071339],
  [-17.475277, -66.067174],
  [-17.485073, -66.067868],
  [-17.490583, -66.072727],
  [-17.490583, -66.075503],
  [-17.493645, -66.076197],
  [-17.493645, -66.079668],
  [-17.495482, -66.085915],
  [-17.494257, -66.087303],
  [-17.497318, -66.089386],
  [-17.50038, -66.095633],
  [-17.507727, -66.106044],
  [-17.508952, -66.110209],
];

const TILES_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Bounding box real del municipio; con el pad evitamos que se pueda alejar del Cercado.
const CERCADO_BOUNDS: [number, number][] = [
  [-17.534055, -66.280267],
  [-17.278124, -66.067174],
];

// Puntos de referencia que la alcaldía destaca en el mapa.
// Imágenes placeholder — sustituir por fotos reales cuando estén disponibles.
const placeholderFoto = (nombre: string, i: number) => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">` +
    `<rect width="100%" height="100%" fill="#2e1065"/>` +
    `<circle cx="50%" cy="42%" r="44" fill="#6e48be" opacity="0.45"/>` +
    `<text x="50%" y="62%" fill="#fff" opacity="0.9" font-family="Arial,sans-serif" font-size="44" font-weight="700" text-anchor="middle">${nombre}</text>` +
    `<text x="50%" y="70%" fill="#fff" opacity="0.5" font-family="Arial,sans-serif" font-size="18" text-anchor="middle">Foto ${i + 1} — imagen de referencia</text>` +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const FotosDe = (nombre: string, cantidad = 3) =>
  Array.from({ length: cantidad }, (_, i) => placeholderFoto(nombre, i));

// Puntos de referencia que la alcaldía destaca en el mapa.
const PINES: PinDatos[] = [
  {
    nombre: 'Cala Cala',
    coords: [-17.381543, -66.160042],
    descripcion: 'Barrio emblemático de la ciudad.',
    imagenes: FotosDe('Cala Cala'),
  },
  {
    nombre: 'Estadio',
    coords: [-17.379086, -66.161564],
    descripcion: 'Complejo deportivo del municipio.',
    imagenes: FotosDe('Estadio'),
  },
  {
    nombre: 'Melchor',
    coords: [-17.393571, -66.180374],
    descripcion: 'Zona de servicios y vías de acceso.',
    imagenes: FotosDe('Melchor'),
  },
];

// Ícono propio (divIcon) para no depender de las imágenes del marcador por defecto de Leaflet.
const pinIcon = () =>
  L.divIcon({
    className: '',
    html: `<div class="${styles.pin}"><span class="${styles.pinDot}"></span></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    tooltipAnchor: [0, -28],
  });

export default function Map() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [seleccion, setSeleccion] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, {
      center: [-17.406, -66.174],
      zoom: 12,
      minZoom: 11,
      maxZoom: 17,
      maxBounds: L.latLngBounds(CERCADO_BOUNDS).pad(0.15),
      maxBoundsViscosity: 0.8,
      zoomControl: true,
      attributionControl: true,
    });
    mapRef.current = map;

    L.tileLayer(TILES_URL, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map);

    L.polygon(CERCADO, {
      color: '#6e48be',
      fillColor: '#6e48be',
      fillOpacity: 0.13,
      weight: 2,
      lineCap: 'round',
      lineJoin: 'round',
    })
      .addTo(map)
      .bindTooltip('Cercado — Cochabamba', { sticky: true, direction: 'center' });

    map.fitBounds(L.latLngBounds(CERCADO), { padding: [40, 40], maxZoom: 13 });

    // Marcadores de puntos de referencia
    PINES.forEach((p, i) => {
      L.marker(p.coords, { icon: pinIcon() })
        .addTo(map)
        .bindTooltip(p.nombre, { permanent: false, direction: 'top' })
        .on('click', () => setSeleccion(i));
    });

    // Mantiene las dimensiones del mapa aunque cambie el contenedor (View Transitions, resize).
    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const pinSeleccionado = seleccion !== null ? PINES[seleccion] : undefined;

  return (
    <div className={styles.wrapper}>
      <div
        ref={containerRef}
        className={styles.map}
        role="application"
        aria-label="Mapa del municipio de Cochabamba (Cercado)"
      />
      {pinSeleccionado && (
        <PinPanel key={pinSeleccionado.nombre} pin={pinSeleccionado} onCerrar={() => setSeleccion(null)} />
      )}
    </div>
  );
}