import * as React from "react";

export interface RevealCardProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  titulo: string;
  categoria: string;
  resumen: string;
  href?: string;
}

const RevealCard = React.forwardRef<HTMLDivElement, RevealCardProps>(
  ({ className, src, titulo, categoria, resumen, href = "#", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`group relative h-[400px] w-full cursor-pointer overflow-hidden rounded-[1.5rem] shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_-15px_rgba(90,58,158,0.5)] ${className}`}
        {...props}
      >
        <a href={href} className="block h-full w-full">
          
          {/* 1. Imagen de fondo con Parallax Zoom */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out group-hover:scale-110"
            style={{ backgroundImage: `url(${src})` }}
          />

          {/* 2. Overlay de Gradiente*/}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090014] via-[#090014]/70 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
          
          {/* 3. Contenedor del Contenido */}
          <div className="relative flex h-full flex-col justify-end p-6 text-white">
            
            {/* Siempre visible: Categoría y Título */}
            <div className="translate-y-4 transition-transform duration-500 group-hover:translate-y-0">
              <span className="text-xs font-bold uppercase tracking-widest text-[#a895d0]">
                {categoria}
              </span>
              <h3 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-white drop-shadow-md">
                {titulo}
              </h3>
            </div>

            {/*EFECTO  */}
            <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-in-out group-hover:grid-rows-[1fr]">
              <div className="overflow-hidden">
                
                {/* Texto resumido */}
                <p className="mt-3 line-clamp-2 text-sm font-medium text-white/80 opacity-0 transition-opacity delay-75 duration-500 group-hover:opacity-100">
                  {resumen}
                </p>

                {/* Botón de Acción */}
                <div className="mt-5 flex items-center justify-between rounded-lg border border-[#5a3a9e]/30 bg-[#5a3a9e]/20 px-4 py-3 opacity-0 backdrop-blur-md transition-all duration-500 group-hover:border-[#5a3a9e]/60 group-hover:bg-[#5a3a9e]/40 group-hover:opacity-100">
                  <span className="text-sm font-semibold tracking-wide text-[#d4c8f0]">Leer noticia</span>
                  <svg className="h-4 w-4 text-[#d4c8f0] transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                
              </div>
            </div>

          </div>
        </a>
      </div>
    );
  }
);

RevealCard.displayName = "RevealCard";
export { RevealCard };