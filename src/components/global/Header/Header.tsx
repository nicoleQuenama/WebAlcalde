/**
 * Header.tsx — HEADER COMPONENT GLOBAL
 *
 * Consume el constant navigation (constants/header/navbar)
 * y renderiza la navegación principal del sitio.
 */

import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
}

interface HeaderProps {
  /** Items de navegación */
  navItems?: NavItem[];
  /** Logo/brand */
  brand?: string;
  /** URL del logo */
  brandHref?: string;
}

const defaultNavItems: NavItem[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Sobre', href: '/sobre' },
  { label: 'Gestión', href: '/gestion' },
];

export default function Header({
  navItems = defaultNavItems,
  brand = 'Alcalde',
  brandHref = '/',
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-primary/90 backdrop-blur-md border-b border-white/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
        {/* Logo / Brand */}
        <a href={brandHref} className="font-roboto-serif text-xl font-bold text-white tracking-tight">
          {brand}
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors tracking-wide"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            {menuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="md:hidden bg-primary/95 backdrop-blur-md border-t border-white/10 px-6 py-4">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block py-3 text-sm font-medium text-white/80 hover:text-white transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
