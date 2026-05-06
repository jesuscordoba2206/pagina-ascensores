'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/80 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-white font-bold text-xl tracking-wider">
          J_web
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-8">
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
          <Link
            href="/login"
            className="uppercase tracking-wide text-sm font-medium bg-cyan-400 text-black px-4 py-2 rounded-md transition-all duration-300 hover:opacity-80"
          >
            Acceso
          </Link>
        </div>
      </div>
    </nav>
  );
}
