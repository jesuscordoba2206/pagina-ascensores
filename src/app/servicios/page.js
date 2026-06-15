import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Cog, Wrench, Hammer, Clock3 } from 'lucide-react';

export default function ServiciosPage() {
  return (
    <div className="relative min-h-screen bg-[url('/fondo_img.jpg')] bg-fixed bg-cover bg-center bg-no-repeat text-white">
      <div className="absolute inset-0 bg-black/75 z-0" />

      <div className="relative z-10">
        <Navbar />

        <section className="pt-28 pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16 text-center">
              <p className="text-cyan-400 uppercase tracking-[0.35em] text-xs mb-4"></p>
              <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">Soluciones diseñadas para el movimiento vertical.</h1>
              <p className="mx-auto mt-6 max-w-2xl text-zinc-400 font-light leading-relaxed">
                Mantenimiento, instalación, reparación y respuesta inmediata para servicios de emergencia.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-cyan-500/15 via-zinc-900/40 to-black/80 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10 hover:scale-[1.01] transition-transform duration-500 h-full">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-400">
                  <Cog className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Mantenimiento</h2>
                <p className="text-zinc-400 font-light leading-relaxed mb-6">
                  Planes predictivos y preventivos para garantizar que cada equipo funcione sin interrupciones.
                </p>
                <Link href="/servicios" className="text-cyan-400 font-bold uppercase tracking-wide text-sm hover:text-white transition-all duration-300">
                  Ver más →
                </Link>
              </div>

              <div className="bg-gradient-to-br from-cyan-500/15 via-zinc-900/40 to-black/80 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10 hover:scale-[1.01] transition-transform duration-500 h-full">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-400">
                  <Wrench className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Instalación</h2>
                <p className="text-zinc-400 font-light leading-relaxed mb-6">
                  Ingeniería de montaje para rascacielos y residencias, pensado para seguridad y fluidez.
                </p>
                <Link href="/servicios" className="text-cyan-400 font-bold uppercase tracking-wide text-sm hover:text-white transition-all duration-300">
                  Ver más →
                </Link>
              </div>

              <div className="bg-gradient-to-br from-cyan-500/15 via-zinc-900/40 to-black/80 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10 hover:scale-[1.01] transition-transform duration-500 h-full">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-400">
                  <Hammer className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Reparación</h2>
                <p className="text-zinc-400 font-light leading-relaxed mb-6">
                  Soporte técnico especializado con repuestos originales y diagnóstico rápido.
                </p>
                <Link href="/servicios" className="text-cyan-400 font-bold uppercase tracking-wide text-sm hover:text-white transition-all duration-300">
                  Ver más →
                </Link>
              </div>

              <div className="bg-gradient-to-br from-cyan-500/15 via-zinc-900/40 to-black/80 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10 hover:scale-[1.01] transition-transform duration-500 h-full">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-400">
                  <Clock3 className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Atención 24/7</h2>
                <p className="text-zinc-400 font-light leading-relaxed mb-6">
                  Servicio de emergencia y rescate inmediato disponible para cualquier incidente en sitio.
                </p>
                <Link href="/servicios" className="text-cyan-400 font-bold uppercase tracking-wide text-sm hover:text-white transition-all duration-300">
                  Ver más →
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-black border-t border-gray-800 py-12 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-gray-500 text-sm tracking-wide">© 2026 J_web. Ingeniería en Transporte Vertical.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
