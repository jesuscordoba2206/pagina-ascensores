"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
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

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const closeMobileMenu = () => setMenuOpen(false);

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out flex items-center justify-between px-8 ${
          isScrolled ? 'bg-black/70 backdrop-blur-md py-1 shadow-black/20' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex h-auto w-40 items-center bg-transparent md:w-52">
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

          <div className="hidden items-center md:flex">
            <Link
              href="/login"
              className="rounded-md bg-cyan-400 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-black transition-all duration-300 hover:opacity-80 md:px-4 md:py-2 md:text-sm"
            >
              Acceso clientes
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative z-50 p-2 md:hidden"
            aria-label={menuOpen ? 'Cerrar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-menu"
          >
            {menuOpen ? <X className="h-7 w-7 text-white" /> : <Menu className="h-7 w-7 text-white" />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-lg md:hidden">
          <div className="w-full max-w-sm px-6">
            <div id="mobile-nav-menu" className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md shadow-2xl">
              <div className="flex flex-col gap-3 text-center">
                <Link href="/" onClick={closeMobileMenu} className="rounded-xl px-4 py-4 text-lg font-bold uppercase tracking-wide text-white transition hover:bg-white/10">
                  Inicio
                </Link>
                <Link href="/empresa" onClick={closeMobileMenu} className="rounded-xl px-4 py-4 text-lg font-bold uppercase tracking-wide text-white transition hover:bg-white/10">
                  Empresa
                </Link>
                <Link href="/servicios" onClick={closeMobileMenu} className="rounded-xl px-4 py-4 text-lg font-bold uppercase tracking-wide text-white transition hover:bg-white/10">
                  Servicios
                </Link>
                <Link href="/login" onClick={closeMobileMenu} className="rounded-xl bg-cyan-400 px-4 py-4 text-lg font-bold uppercase tracking-wide text-black transition hover:opacity-90">
                  Acceso clientes
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
