import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function EmpresaPage() {
  return (
    <div className="relative min-h-screen bg-[url('/fondo_img.jpg')] bg-fixed bg-cover bg-center bg-no-repeat text-white">
      <div className="absolute inset-0 bg-black/75 z-0" />

      <div className="relative z-10">
        <Navbar />

        <section className="relative overflow-hidden">
          <div className="pt-28 pb-20 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
                <div className="space-y-6">
                  <p className="text-cyan-400 uppercase tracking-[0.35em] text-xs mb-4">Empresa</p>
                  <h1 className="text-6xl md:text-7xl font-bold text-white tracking-tight">Confianza y experiencia en proyectos que elevan a nuestros clientes.</h1>
                  <p className="max-w-3xl text-zinc-400 font-light leading-relaxed">
                    Somos el aliado estratégico en transporte vertical, acompañando cada etapa con excelencia técnica y atención dedicada.
                  </p>
                </div>

                <div className="grid gap-6">
                  <div className="bg-gradient-to-br from-cyan-500/15 via-zinc-900/40 to-black/80 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10 hover:scale-[1.01] transition-transform duration-500">
                    <h2 className="text-xl font-semibold text-zinc-300 mb-4 uppercase tracking-wide">Misión</h2>
                    <p className="text-zinc-400 font-light leading-relaxed">
                      Brindar soluciones confiables en transporte vertical, ofreciendo ascensores seguros, cómodos y eficientes, adaptados a cada espacio y necesidad. Nuestro compromiso es garantizar la satisfacción del cliente mediante un servicio responsable y un soporte técnico oportuno.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-500/15 via-zinc-900/40 to-black/80 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10 hover:scale-[1.01] transition-transform duration-500">
                    <h2 className="text-xl font-semibold text-zinc-300 mb-4 uppercase tracking-wide">Visión</h2>
                    <p className="text-zinc-400 font-light leading-relaxed">
                      Convertirnos en la empresa líder del transporte vertical en el mercado nacional, reconocidos como una organización sólida, rentable y modelo de otras organizaciones mediante nuestra búsqueda constante de la mejora continua.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 grid gap-6 md:grid-cols-2">
                <div className="bg-gradient-to-br from-cyan-500/15 via-zinc-900/40 to-black/80 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10 hover:scale-[1.01] transition-transform duration-500">
                  <p className="text-7xl md:text-8xl font-bold text-white leading-none">25+</p>
                  <p className="mt-4 text-zinc-400 font-light text-lg">Años de Experiencia</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-500/15 via-zinc-900/40 to-black/80 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10 hover:scale-[1.01] transition-transform duration-500">
                  <p className="text-7xl md:text-8xl font-bold text-white leading-none">100+</p>
                  <p className="mt-4 text-zinc-400 font-light text-lg">Proyectos Terminados</p>
                </div>
              </div>

              <div className="mt-14 text-center">
                <Link
                  href="/empresa"
                  className="inline-block bg-cyan-400 text-black px-8 py-3 rounded-[2.5rem] font-bold uppercase tracking-wide transition-all duration-300 hover:opacity-90"
                >
                  Conoce nuestros proyectos
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
