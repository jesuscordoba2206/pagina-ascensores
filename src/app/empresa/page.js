import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function EmpresaPage() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />

      <section className="relative overflow-hidden bg-fixed bg-[url('/cityscape.svg')] bg-center bg-cover">
        <div className="absolute inset-0 bg-black/80"></div>
        <div className="relative pt-28 pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
              <div className="space-y-6">
                <p className="text-cyan-400 uppercase tracking-[0.35em] text-xs mb-4">Empresa</p>
                <h1 className="text-6xl md:text-7xl font-bold text-white tracking-tight">Confianza, experiencia y proyectos que elevan cada edificio.</h1>
                <p className="max-w-3xl text-zinc-400 font-light leading-relaxed">
                  Somos el aliado estratégico en transporte vertical, acompañando cada etapa con excelencia técnica y atención dedicada.
                </p>
              </div>

              <div className="grid gap-6">
                <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10 hover:scale-[1.01] transition-transform duration-500">
                  <h2 className="text-xl font-semibold text-zinc-300 mb-4 uppercase tracking-wide">Misión</h2>
                  <p className="text-zinc-400 font-light leading-relaxed">
                    Liderar el transporte vertical en Colombia con soluciones seguras, eficientes y adaptadas a cada proyecto.
                  </p>
                </div>
                <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10 hover:scale-[1.01] transition-transform duration-500">
                  <h2 className="text-xl font-semibold text-zinc-300 mb-4 uppercase tracking-wide">Visión</h2>
                  <p className="text-zinc-400 font-light leading-relaxed">
                    Ser reconocidos como la referencia de calidad y servicio en ingeniería de ascensores y escaleras eléctricas.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10 hover:scale-[1.01] transition-transform duration-500">
                <p className="text-7xl md:text-8xl font-bold text-white leading-none">30+</p>
                <p className="mt-4 text-zinc-400 font-light text-lg">Años de Experiencia</p>
              </div>
              <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10 hover:scale-[1.01] transition-transform duration-500">
                <p className="text-7xl md:text-8xl font-bold text-white leading-none">1.2k+</p>
                <p className="mt-4 text-zinc-400 font-light text-lg">Proyectos Terminados</p>
              </div>
            </div>

            <div className="mt-14 text-center">
              <Link
                href="/empresa"
                className="inline-block bg-cyan-400 text-black px-8 py-3 rounded-[2.5rem] font-bold uppercase tracking-wide transition-all duration-300 hover:opacity-90"
              >
                Conoce nuestra historia
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
  );
}
