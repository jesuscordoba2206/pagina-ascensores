'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out flex items-center justify-between px-8 ${
        isScrolled ? 'bg-black/70 backdrop-blur-md py-1 shadow-black/20' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center w-44 h-auto">
          <Image
            src="/logo.png"
            alt="J_web logo"
            width={180}
            height={60}
            className={`transition-all duration-300 ease-in-out h-auto w-full object-contain ${
              isScrolled ? 'scale-85 opacity-90' : 'scale-100 opacity-100'
            }`}
            priority
          />
        </Link>

        {/* Navigation Links (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="uppercase tracking-wide text-white text-sm font-medium transition-all duration-300 hover:text-cyan-400"
          >
            Inicio
          </Link>
          <Link
            href="/empresa"
            className="uppercase tracking-wide text-white text-sm font-medium transition-all duration-300 hover:text-cyan-400"
          >
            Empresa
          </Link>
          <Link
            href="/servicios"
            className="uppercase tracking-wide text-white text-sm font-medium transition-all duration-300 hover:text-cyan-400"
          >
            Servicios
          </Link>
        </div>

        {/* Acceso button - always visible, smaller on mobile */}
        <div className="flex items-center">
          <Link
            href="/login"
            className="uppercase tracking-wide text-xs md:text-sm font-medium bg-cyan-400 text-black px-3 py-1.5 md:px-4 md:py-2 rounded-md transition-all duration-300 hover:opacity-80"
          >
            Acceso
          </Link>
        </div>
      </div>
    </nav>
  );
}
