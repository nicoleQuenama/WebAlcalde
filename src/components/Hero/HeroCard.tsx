import { useState } from 'react';

const IMAGENES = [
  { id: 1, src: 'https://images.unsplash.com/photo-1577412647305-991150c7d163?q=80&w=600' },
  { id: 2, src: 'https://images.unsplash.com/photo-1555848962-6e79363ec58f?q=80&w=600' },
  { id: 3, src: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=600' },
];

export default function HeroCards() {
  const [actual, setActual] = useState(1);
  const [modalAbierto, setModalAbierto] = useState(false);

  const siguiente = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActual((prev) => (prev + 1) % IMAGENES.length);
  };

  const anterior = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActual((prev) => (prev - 1 + IMAGENES.length) % IMAGENES.length);
  };

  const abrirModal = () => setModalAbierto(true);
  const cerrarModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalAbierto(false);
  };

  return (
    <>
      {/* --- VISTA NORMAL EN EL HERO --- */}
      <div className="relative w-full h-[550px] flex items-center justify-center">
        
        {/* Contenedor de las cartas */}
        <div className="relative w-[320px] h-[450px] lg:w-[360px] lg:h-[500px]">
          {IMAGENES.map((img, index) => {
            let posicion = 'oculta';
            if (index === actual) posicion = 'centro';
            else if (index === (actual - 1 + IMAGENES.length) % IMAGENES.length) posicion = 'izquierda';
            else if (index === (actual + 1) % IMAGENES.length) posicion = 'derecha';

            const estilosBase = "absolute top-0 left-0 w-full h-full rounded-3xl bg-cover bg-center border-4 border-white/90 shadow-2xl transition-all duration-700 ease-in-out";
            
            const estilosPosicion = {
              'centro': 'z-30 scale-100 translate-x-0 rotate-0 opacity-100 cursor-pointer shadow-[0_30px_60px_rgba(0,0,0,0.6)]',
              'izquierda': 'z-20 scale-90 -translate-x-36 -rotate-6 opacity-40 cursor-pointer hover:opacity-80',
              'derecha': 'z-20 scale-90 translate-x-36 rotate-6 opacity-40 cursor-pointer hover:opacity-80',
              'oculta': 'z-10 scale-75 opacity-0',
            };

            return (
              <div
                key={img.id}
                className={`${estilosBase} ${estilosPosicion[posicion as keyof typeof estilosPosicion]}`}
                style={{ backgroundImage: `url(${img.src})` }}
                onClick={() => {
                  if (posicion === 'centro') abrirModal();
                  if (posicion === 'izquierda') anterior();
                  if (posicion === 'derecha') siguiente();
                }}
              />
            );
          })}
        </div>

        {/* Controles Inferiores */}
        <div className="absolute -bottom-4 flex gap-8 z-40">
          <button onClick={anterior} className="bg-white/20 hover:bg-white/40 backdrop-blur-md p-4 rounded-full text-white transition-transform hover:scale-110 shadow-lg">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={siguiente} className="bg-white/20 hover:bg-white/40 backdrop-blur-md p-4 rounded-full text-white transition-transform hover:scale-110 shadow-lg">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {/* --- MODAL (EFECTO CINE CON FONDO DESENFOCADO) --- */}
      {modalAbierto && (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-3xl animate-[fadeIn_0.3s_ease-out]"
            onClick={cerrarModal}
        >
          
          {/* Botón Cerrar (X) */}
          <button 
            onClick={cerrarModal} 
            className="absolute top-6 right-6 lg:top-10 lg:right-10 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md transition-all z-[110]"
            aria-label="Cerrar modal"
          >
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {/* Flecha Izquierda Modal */}
          <button 
            onClick={(e) => { e.stopPropagation(); anterior(); }} 
            className="absolute left-4 lg:left-12 text-white/70 hover:text-white bg-black/20 hover:bg-black/50 rounded-full p-4 hover:scale-110 transition-all z-[110]"
          >
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>

          {/* Imagen en grande */}
          <img 
            src={IMAGENES[actual].src} 
            alt="Ampliación" 
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.6)] animate-[zoomIn_0.4s_ease-out] z-[105]"
          />

          {/* Flecha Derecha Modal */}
          <button 
            onClick={(e) => { e.stopPropagation(); siguiente(); }} 
            className="absolute right-4 lg:right-12 text-white/70 hover:text-white bg-black/20 hover:bg-black/50 rounded-full p-4 hover:scale-110 transition-all z-[110]"
          >
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>

        </div>
      )}
    </>
  );
}