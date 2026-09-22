import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { NoticiaFeed } from "@lib/db";
import ArrowButton from "@components/ui/ArrowButton/ArrowButton";

interface NewsModalProps {
  noticia: NoticiaFeed | null;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  todasLasNoticias: NoticiaFeed[];
  indiceActual: number;
}

export default function NewsModal({
  noticia,
  isOpen,
  onClose,
  onNext,
  onPrev,
  todasLasNoticias,
  indiceActual,
}: NewsModalProps) {

  // Bloquea el scroll del fondo y lo restaura al cerrar
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose, onNext, onPrev]);

  const handleShare = useCallback(async () => {
    if (!noticia) return;
    const url = window.location.href;
    const title = noticia.titulo;
    const text = noticia.resumen;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
      } catch {}
    }
  }, [noticia]);

  if (!isOpen || !noticia) return null;

  const siguienteIndice = indiceActual === todasLasNoticias.length - 1 ? 0 : indiceActual + 1;
  const siguienteNoticia = todasLasNoticias[siguienteIndice];

  return createPortal(
    <div className="noticias-modal-overlay" onClick={onClose}>

      <div className="noticias-modal-bg" />

      <button onClick={onClose} className="noticias-modal__cerrar" aria-label="Cerrar modal">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <ArrowButton
        direction="left"
        variant="modal"
        onClick={(e) => { e?.stopPropagation(); onPrev(); }}
        aria-label="Noticia anterior"
        className="!absolute !left-2 !z-[70] md:!left-6"
      />

      {/* stopPropagation evita que el clic dentro del recuadro cierre el modal */}
      <div className="noticias-modal" onClick={(e) => e.stopPropagation()}>

        <div className="noticias-modal__imagen-wrap">
          <div className="noticias-modal__imagen-blur" style={{ backgroundImage: `url(${noticia.src})` }} />
          <div className="noticias-modal__imagen-overlay" />
          <div className="noticias-modal__imagen">
            <img src={noticia.src} alt={noticia.titulo} loading="lazy" decoding="async" />
          </div>
        </div>

        <div className="noticias-modal__contenido !p-0 relative flex flex-col h-full overscroll-none">

          <div className="p-5 md:p-6 pb-8">

            <div className="mb-3 flex justify-end">
              <button onClick={(e) => { e.stopPropagation(); handleShare(); }} className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(160,120,220,0.2)] bg-[rgba(90,58,158,0.3)] text-white/80 transition-all hover:bg-[rgba(90,58,158,0.8)] hover:text-white hover:scale-110" title="Compartir">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-2 sm:gap-3">
              <span className="text-[0.625rem] sm:text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-accent)]">{noticia.categoria}</span>
              <span className="text-white/30 text-[0.625rem]">•</span>
              <time className="text-[0.625rem] sm:text-xs font-medium text-white/40">
                {new Date(noticia.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
              </time>
            </div>

            <h2 className="mb-2 text-lg sm:text-xl md:text-2xl font-bold leading-snug text-white">{noticia.titulo}</h2>

            <div className="h-px mb-4 bg-gradient-to-r from-[rgba(90,58,158,0.4)] to-transparent"></div>

            <div className="flex flex-col gap-3 text-[0.875rem] sm:text-[0.9375rem] leading-relaxed text-white/75 min-w-0">
              <p className="break-words font-medium text-white/90">{noticia.resumen}</p>
              <p className="break-words">Aquí irá todo el cuerpo completo de la noticia detallando los pormenores del proyecto, declaraciones oficiales y los próximos pasos a seguir para beneficiar a la población de Cochabamba.</p>
              <p className="break-words">Este proyecto representa un avance significativo para nuestra ciudad, mejorando la calidad de vida de miles de cochabambinos y marcando un precedente importante en gestión municipal.</p>
              <p className="break-words">Las autoridades municipales han destacado la importancia de esta iniciativa, la cual forma parte del plan integral de desarrollo urbano que se viene implementando durante este período de gestión.</p>
              <p className="break-words">Las autoridades municipales han destacado la importancia de esta iniciativa, la cual forma parte del plan integral de desarrollo urbano que se viene implementando durante este período de gestión.</p>
            </div>
          </div>

          {/* Barra "siguiente noticia": sticky al fondo de la columna (bg cubre el scroll) */}
          <div className="sticky bottom-0 z-20 w-full bg-[#2a1252] px-4 py-3 md:px-5 border-t border-[rgba(160,120,220,0.15)] shadow-[0_-10px_20px_rgba(26,15,48,0.7)] mt-auto">
            <button
              className="flex flex-col justify-center px-3 py-2 rounded-[var(--radius-md)] border border-[rgba(160,120,220,0.15)] bg-[rgba(90,58,158,0.08)] text-left cursor-pointer transition-all w-full hover:bg-[rgba(90,58,158,0.25)] hover:border-[rgba(160,120,220,0.4)]"
              onClick={(e) => { e.stopPropagation(); onNext(); }}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[0.5rem] font-bold uppercase tracking-[0.1em] text-[var(--color-accent)]">
                  Siguiente noticia
                </span>
                <div className="flex items-center gap-1 text-[0.5rem] text-white/40">
                  <span className="truncate max-w-[80px]">{siguienteNoticia.categoria}</span>
                </div>
              </div>

              <h4 className="text-[0.75rem] sm:text-[0.8125rem] font-semibold leading-tight text-white/90 line-clamp-1 mt-0.5">
                {siguienteNoticia.titulo}
              </h4>
            </button>
          </div>

        </div>
      </div>

      <ArrowButton
        direction="right"
        variant="modal"
        onClick={(e) => { e?.stopPropagation(); onNext(); }}
        aria-label="Siguiente noticia"
        className="!absolute !right-2 !z-[70] md:!right-6"
      />
    </div>,
    document.body
  );
}