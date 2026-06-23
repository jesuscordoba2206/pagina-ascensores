'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function ServiciosPage() {
  return (
    <div className="relative min-h-screen bg-[url('/fondo_img.jpg')] bg-fixed bg-cover bg-center bg-no-repeat text-white">
      <div className="pointer-events-none absolute inset-0 bg-black/75" />

      <div className="relative z-10">
        <Navbar />

        <section className="px-6 pb-20 pt-28">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <p className="mb-4 text-xs uppercase tracking-[0.35em] text-cyan-400">Servicios Premium</p>
              <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
                Elige tu linea de servicio
              </h1>
              <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-zinc-300">
                Toca una opcion para entrar a los detalles del servicio.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Link
                href="/servicios/ascensores"
                className="relative z-20 flex min-h-[170px] items-center justify-center rounded-[2.2rem] border border-cyan-500/30 bg-white/10 px-6 py-10 text-center text-2xl font-black uppercase tracking-[0.18em] text-cyan-300 backdrop-blur-md transition-all duration-300 hover:scale-[1.01] hover:bg-white/15 hover:text-cyan-200 active:scale-[0.99]"
              >
                Ascensores
              </Link>

              <Link
                href="/servicios/escaleras"
                className="relative z-20 flex min-h-[170px] items-center justify-center rounded-[2.2rem] border border-cyan-500/30 bg-white/10 px-6 py-10 text-center text-2xl font-black uppercase tracking-[0.18em] text-cyan-300 backdrop-blur-md transition-all duration-300 hover:scale-[1.01] hover:bg-white/15 hover:text-cyan-200 active:scale-[0.99]"
              >
                Escaleras electricas
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-gray-800 bg-black py-12 px-6">
          <div className="mx-auto max-w-6xl text-center">
            <p className="text-sm tracking-wide text-gray-500">© 2026 J_web. Ingenieria en Transporte Vertical.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
