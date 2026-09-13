import { useState } from "react";
import type { NavItem } from "../../types/nav";
import { MEDIA } from "../../lib/media";
import  "../../styles/global.css";

interface Props {
  enlaces: NavItem[];
}

export default function HeaderMovil({ enlaces }: Props) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      
      <div className="flex flex-wrap items-center justify-between w-full bg-primary border-b border-white/10 py-4 px-8 lg:px-12 transition-all duration-300">
        
        {/* Lado Izquierdo: Logo y Nombre */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center shadow-md hover:scale-105 hover:rotate-6 transition-transform duration-300 cursor-pointer">
            <a href="/" className="flex items-center justify-center shadow-md hover:scale-105 hover:rotate-6 transition-transform duration-300 cursor-pointer">
            <img
              src={MEDIA.logo}
              alt="Manfred Reyes Villa"
              className="h-10 lg:h-12 w-auto object-contain"
              loading="eager"
              decoding="async"
              width={160}
              height={48}
            />
             </a>
          </div>
        </div>

        {/* Botón Hamburguesa */}
        <button 
          className="lg:hidden text-white active:scale-90 transition-transform"
          onClick={() => setAbierto(!abierto)}
          aria-label="Abrir menú"
        >
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            {abierto ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Centro y Derecha: Enlaces y Botón */}
        <nav className={`${abierto ? 'flex flex-col w-full mt-5 gap-6 pb-4' : 'hidden'} lg:flex lg:flex-row lg:w-auto lg:mt-0 gap-6 lg:gap-8 items-center`}>
          {enlaces.map((enlace) => (
            <a 
              key={enlace.ruta} 
              href={enlace.ruta} 
              className="relative
                font-roboto-serif
                font-normal
                not-italic
                text-purple-100
                hover:text-white
                transition-colors duration-300
                group">
              {enlace.nombre}
              <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-purple-300 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}