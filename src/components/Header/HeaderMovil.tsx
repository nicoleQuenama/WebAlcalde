import { useState } from "react";
import type { NavItem } from "../../types/nav";

interface Props {
  enlaces: NavItem[];
}

export default function HeaderMovil({ enlaces }: Props) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      
      <div className="flex flex-wrap items-center justify-between w-full bg-purple-900/90 backdrop-blur-md border-b border-purple-400/40 py-4 px-8 lg:px-12 shadow-[0_10px_30px_rgba(76,29,149,0.4)] transition-all duration-300">
        
        {/* Lado Izquierdo: Logo y Nombre */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center shadow-md hover:scale-105 hover:rotate-6 transition-transform duration-300 cursor-pointer">
            <a href="/" className="flex items-center justify-center shadow-md hover:scale-105 hover:rotate-6 transition-transform duration-300 cursor-pointer">
            <img
              src="../../../public/multimedia/Logo Alcalde.png"
              alt="Logo"
              className="h-10 lg:h-12 w-auto object-contain"
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
              className="relative text-purple-100 hover:text-white text-base lg:text-lg font-medium transition-colors duration-300 group"
            >
              {enlace.nombre}
              <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-purple-300 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}