export interface NoticiaFeed {
  id: number | string;
  src: string;
  titulo: string;
  categoria: string;
  fecha: string;
  resumen: string;
}

export default function NewsFeedCard({ noticia }: { noticia: NoticiaFeed }) {
  return (
    <article className="noticia-card">
      <div 
        className="noticia-card__imagen"
        style={{ backgroundImage: `url(${noticia.src})` }}
      />
      <div className="noticia-card__overlay" />
      <div className="noticia-card__contenido">
        <div className="noticia-card__titulo-wrap">
          <span className="noticia-card__categoria">{noticia.categoria}</span>
          <h3 className="noticia-card__titulo">{noticia.titulo}</h3>
        </div>
        <div className="noticia-card__detalles">
          <div className="noticia-card__detalles-inner">
            <p className="noticia-card__resumen">{noticia.resumen}</p>
            <div className="noticia-card__footer">
              <time className="noticia-card__fecha">
                {new Date(noticia.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
              </time>
              <div className="noticia-card__leer">
                <span className="noticia-card__leer-texto">Leer</span>
                <svg className="noticia-card__leer-icono" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
