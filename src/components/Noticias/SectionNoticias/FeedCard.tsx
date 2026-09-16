import { memo } from 'react';

export interface NoticiaFeed {
  id: number | string;
  src: string;
  titulo: string;
  categoria: string;
  fecha: string;
  resumen: string;
}

const NewsFeedCard = memo(function NewsFeedCard({ noticia }: { noticia: NoticiaFeed }) {
  return (
    <article className="noticia-card">
      <div 
        className="noticia-card__imagen"
        style={{ backgroundImage: `url(${noticia.src})` }}
      />
      <div className="noticia-card__overlay" />
      <div className="noticia-card__contenido">
        <div className="noticia-card__titulo-wrap">
          <span className="text-[0.625rem] font-bold uppercase tracking-[0.1em] text-[var(--color-accent)] [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">{noticia.categoria}</span>
          <h3 className="mt-1.5 text-[1.125rem] font-bold leading-tight text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.5)] line-clamp-2">{noticia.titulo}</h3>
        </div>
        <div className="noticia-card__detalles">
          <div className="noticia-card__detalles-inner">
            <p className="noticia-card__resumen">{noticia.resumen}</p>
            <div className="noticia-card__footer">
              <time className="text-[0.625rem] font-semibold tracking-[0.05em] text-white/85">
                {new Date(noticia.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
              </time>
              <div className="flex items-center gap-1.5 text-[#d4c8f0]">
                <span className="text-[0.625rem] font-bold uppercase tracking-[0.1em]">Leer</span>
                <svg className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
});

export default NewsFeedCard;
