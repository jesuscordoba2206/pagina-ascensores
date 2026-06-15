import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-black text-white">
      <Navbar />

      {/* HERO */}
      <section className="h-screen relative overflow-hidden bg-black -mt-24 md:-mt-28">
        {/* VIDEO */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/fondo_video.mp4" type="video/mp4" />
        </video>

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* TRANSICIÓN */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />

        {/* CONTENIDO */}
        <div className="relative h-full max-w-6xl mx-auto px-6 md:px-12 flex flex-col justify-center pt-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-none md:leading-tight max-w-3xl">
              Elevators Ingeniería en Transporte Vertical
            </h1>

            <p className="text-base md:text-xl font-normal text-gray-400 mt-6 max-w-xl leading-relaxed mb-8">
              Expertos en soluciones verticales a nivel nacional.
              Innovación y confiabilidad para sus equipos.
            </p>

            <Link
              href="/login"
              className="inline-block bg-cyan-400 text-black px-8 py-3 rounded-md font-medium uppercase tracking-wide transition-all duration-300 hover:opacity-80"
            >
              Acceso Clientes
            </Link>
          </div>
        </div>
      </section>

      <main className="relative min-h-screen bg-[url('/fondo_img.jpg')] bg-fixed bg-cover bg-center bg-no-repeat">
        <div className="absolute inset-0 bg-black/75" />

        <div className="relative z-10 py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* ASCENSORES */}
              <div className="md:col-span-6 bg-gradient-to-br from-cyan-500/15 via-zinc-900/40 to-black/80 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-12 hover:scale-[1.01] transition-transform duration-500">
                <p className="text-[10px] text-cyan-400 tracking-[0.2em] uppercase mb-2">SERVICIO ESPECIALIZADO</p>
                <h3 className="text-3xl md:text-4xl font-bold tracking-wide text-white mb-4">Ascensores</h3>
                <p className="text-sm md:text-base font-normal text-gray-300 leading-relaxed mb-6">
                  Sistemas de elevación de última generación. Instalación, mantenimiento y modernización de ascensores residenciales, comerciales e industriales.
                </p>
                <Link href="/servicios" className="text-cyan-400 hover:text-white transition-all duration-300 font-bold uppercase text-sm tracking-wide">Ver más →</Link>
              </div>

              {/* ESCALERAS */}
              <div className="md:col-span-6 bg-gradient-to-br from-cyan-500/15 via-zinc-900/40 to-black/80 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-12 hover:scale-[1.01] transition-transform duration-500">
                <p className="text-[10px] text-cyan-400 tracking-[0.2em] uppercase mb-2">SERVICIO ESPECIALIZADO</p>
                <h3 className="text-3xl md:text-4xl font-bold tracking-wide text-white mb-4">Escaleras Eléctricas</h3>
                <p className="text-sm md:text-base font-normal text-gray-300 leading-relaxed mb-6">
                  Soluciones eficientes en escaleras y pasillos rodantes. Diseño ergonómico, bajo consumo energético y máxima durabilidad.
                </p>
                <Link href="/servicios" className="text-cyan-400 hover:text-white transition-all duration-300 font-bold uppercase text-sm tracking-wide">Ver más →</Link>
              </div>

              {/* ASESORIA */}
              <div className="md:col-span-8 bg-gradient-to-br from-cyan-500/15 via-zinc-900/40 to-black/80 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10 hover:scale-[1.01] transition-transform duration-500">
                <h3 className="text-xl md:text-2xl font-bold tracking-wide text-cyan-400 uppercase mb-4 border-b border-cyan-400/20 pb-2">
                  ASESORIA
                </h3>
                <p className="text-sm md:text-base font-normal text-gray-300 leading-relaxed">
                  Tecnología, seguridad y confianza en cada elevación.
                  Brindamos soluciones integrales en ascensores y sistemas de transporte vertical: diseño, fabricación, instalación, modernización, mantenimiento, reparación, inspección y certificación, cumpliendo con la Norma NTC 5926-1, 2, 3 y 4 y estándares acreditados por ONAC.
                </p>
              </div>

              {/* CONTACTOS */}
              <div className="md:col-span-4 bg-gradient-to-br from-cyan-500/15 via-zinc-900/40 to-black/80 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10 hover:scale-[1.01] transition-transform duration-500">
                <h3 className="text-xl md:text-2xl font-bold tracking-wide text-cyan-400 uppercase mb-4 border-b border-cyan-400/20 pb-2">
                  CONTACTOS
                </h3>
                <p className="text-sm md:text-base font-normal text-gray-300 leading-relaxed">
                  TELEFONO: 3105751970
                  TELEFONO: 3202051034
                  correo: elevatorscompanyantioquia@gmail.com
                </p>
              </div>
            </div>

            <div className="mt-16 text-center">
              <Link
                href="/login"
                className="inline-block bg-cyan-400 text-black px-8 py-3 rounded-md font-medium uppercase tracking-wide transition-all duration-300 hover:opacity-80"
              >
                Ingresar al Portal
              </Link>
            </div>
          </div>
        </div>

        <footer className="relative border-t border-gray-800 py-12 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-gray-500 text-sm tracking-wide">
              © 2026 J_web. Ingeniería en Transporte Vertical.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
