import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './Map.module.css';
import PinPanel from './PinPanel';
import { CERCADO, CERCADO_BOUNDS, TILES_URL, ATTRIBUTION } from '@constants/map/cercado';
import { PINES } from '@constants/map/pines';

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