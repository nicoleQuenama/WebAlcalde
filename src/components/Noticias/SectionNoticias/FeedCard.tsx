// src/components/Noticias/NewsFeedCard.tsx
export interface NoticiaFeed {
  id: number | string;
  src: string;
  titulo: string;
  categoria: string;
  fecha: string;
}

export default function NewsFeedCard({ noticia }: { noticia: NoticiaFeed }) {
  const fechaFormateada = new Date(noticia.fecha).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <article className="group relative flex h-[380px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#472d82]/20 hover:shadow-xl hover:shadow-[#472d82]/10">
      
      {/* Contenedor de la Imagen */}
      <div className="relative h-48 w-full shrink-0 overflow-hidden">
        <img 
          src={noticia.src} 
          alt={noticia.titulo} 
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
          loading="lazy" 
        />
        {/* Overlay sutil en la imagen */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
        
        {/* Badge de categoría */}
        <div className="absolute left-4 top-4">
          <span className="inline-flex items-center rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#472d82] shadow-sm backdrop-blur-sm">
            {noticia.categoria}
          </span>
        </div>
      </div>

      {/* Contenido (Textos) */}
      <div className="flex flex-grow flex-col justify-between p-5">
        <div>
          <h3 className="text-lg font-semibold leading-snug text-gray-900 line-clamp-2 transition-colors duration-200 group-hover:text-[#472d82]">
            {noticia.titulo}
          </h3>
        </div>
        
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <time className="flex items-center gap-2 text-sm text-gray-400">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {fechaFormateada}
          </time>
          
          {/* Flecha de enlace */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-400 transition-all duration-300 group-hover:bg-[#472d82] group-hover:text-white">
            <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>
    </article>
  );
}
