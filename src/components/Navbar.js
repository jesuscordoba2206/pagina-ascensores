"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const closeMobileMenu = () => setMenuOpen(false);

  return (
    <>
      {/* NAVBAR BASE */}
      <nav
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 ease-in-out flex items-center justify-between px-6 md:px-8 ${
          isScrolled ? 'bg-black/80 backdrop-blur-md py-2 shadow-lg shadow-black/20' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between relative">
          
          {/* Logo */}
          <Link href="/" className="flex h-auto w-36 items-center bg-transparent md:w-52">
            <Image
              src="/logo-v2.png"
              alt="Elevators ITV logo"
              width={200}
              height={154}
              className={`h-auto w-full object-contain bg-transparent transition-all duration-300 ease-in-out ${
                isScrolled ? 'scale-90 opacity-90' : 'scale-100 opacity-100'
              }`}
              priority
            />
          </Link>

          {/* Menú Escritorio */}
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/" className="text-sm font-medium uppercase tracking-wide text-white transition-all duration-300 hover:text-cyan-400">
              Inicio
            </Link>
            <Link href="/empresa" className="text-sm font-medium uppercase tracking-wide text-white transition-all duration-300 hover:text-cyan-400">
              Empresa
            </Link>
            <Link href="/servicios" className="text-sm font-medium uppercase tracking-wide text-white transition-all duration-300 hover:text-cyan-400">
              Servicios
            </Link>
          </div>

          {/* Botón Escritorio */}
          <div className="hidden items-center md:flex">
            <Link
              href="/login"
              className="rounded-md bg-cyan-400 px-4 py-2 text-sm font-medium uppercase tracking-wide text-black transition-all duration-300 hover:opacity-80"
            >
              Acceso clientes
            </Link>
          </div>

          {/* Botón Hamburguesa: visible, estilizado con bg-white/10 y con z-50 para prioridad táctil */}
          <button
            type="button"
            onClick={toggleMenu}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-50 p-3 md:hidden rounded-lg bg-white/10 backdrop-blur-md border border-white/10 touch-manipulation active:scale-95 transition-all"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-7 w-7 text-white" /> : <Menu className="h-7 w-7 text-white" />}
          </button>
        </div>
      </nav>

      {/* MENÚ DESPLEGABLE MÓVIL PREMIUM CON SOPORTE COMPLETO PARA SAFARI */}
      {menuOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-lg md:hidden p-4"
          style={{ WebkitBackdropFilter: 'blur(16px)' }}
          onClick={closeMobileMenu}
        >
          <div 
            className="w-full max-w-sm mt-12 rounded-2xl border border-white/20 bg-black/40 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-4 text-center">
              <Link href="/" onClick={closeMobileMenu} className="rounded-xl px-4 py-4 text-xl font-bold uppercase tracking-wide text-white transition active:bg-white/10 touch-manipulation">
                Inicio
              </Link>
              <Link href="/empresa" onClick={closeMobileMenu} className="rounded-xl px-4 py-4 text-xl font-bold uppercase tracking-wide text-white transition active:bg-white/10 touch-manipulation">
                Empresa
              </Link>
              <Link href="/servicios" onClick={closeMobileMenu} className="rounded-xl px-4 py-4 text-xl font-bold uppercase tracking-wide text-white transition active:bg-white/10 touch-manipulation">
                Servicios
              </Link>
              <Link href="/login" onClick={closeMobileMenu} className="rounded-xl bg-cyan-400 px-4 py-4 text-xl font-bold uppercase tracking-wide text-black transition active:opacity-80 shadow-lg touch-manipulation">
                Acceso clientes
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
