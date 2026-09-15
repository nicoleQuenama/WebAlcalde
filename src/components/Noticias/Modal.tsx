import { useEffect } from "react";
import type { NoticiaFeed } from "./SectionNoticias/FeedCard";

interface NewsModalProps {
  noticia: NoticiaFeed | null;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function NewsModal({ noticia, isOpen, onClose, onNext, onPrev }: NewsModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen || !noticia) return null;

  return (
    <div className="noticias-modal-overlay">
      <div className="noticias-modal-bg" onClick={onClose} />

      <button 
        onClick={(e) => { e.stopPropagation(); onPrev(); }} 
        className="noticias-modal__flecha noticias-modal__flecha--izquierda"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div 
        className="noticias-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="noticias-modal__cerrar"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="noticias-modal__imagen-wrap">
          <div 
            className="noticias-modal__imagen-blur"
            style={{ backgroundImage: `url(${noticia.src})` }}
          />
          <div className="noticias-modal__imagen-overlay" />
          <div className="noticias-modal__imagen">
            <img 
              src={noticia.src} 
              alt={noticia.titulo}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <div className="noticias-modal__contenido">
          <button className="noticias-modal__compartir" title="Compartir">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          <div className="noticias-modal__meta">
            <span className="noticias-modal__categoria">{noticia.categoria}</span>
            <span className="noticias-modal__separador">•</span>
            <time className="noticias-modal__fecha">
              {new Date(noticia.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </time>
          </div>

          <h2 className="noticias-modal__titulo">{noticia.titulo}</h2>

          <div className="noticias-modal__divider"></div>

          <div className="noticias-modal__texto">
            <p>{noticia.resumen}</p>
            <p>
              Aquí irá todo el cuerpo completo de la noticia detallando los pormenores del proyecto, 
              declaraciones oficiales y los próximos pasos a seguir para beneficiar a la población de Cochabamba.
            </p>
            <p>
              Este proyecto representa un avance significativo para nuestra ciudad, mejorando la calidad 
              de vida de miles de cochabambinos y marcando un precedente importante en gestión municipal.
            </p>
            <p>
              Las autoridades municipales han destacado la importancia de esta iniciativa, la cual 
              forma parte del plan integral de desarrollo urbano que se viene implementando durante 
              este período de gestión.
            </p>
          </div>
        </div>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onNext(); }} 
        className="noticias-modal__flecha noticias-modal__flecha--derecha"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
