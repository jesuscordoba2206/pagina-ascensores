import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-black text-white">
      <Navbar />

      {/* HERO */}
      <section className="h-screen relative overflow-hidden bg-black">
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
        <div className="relative h-full max-w-6xl mx-auto px-6 md:px-12 flex flex-col justify-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
              Elevators Ingeniería en Transporte Vertical
            </h1>

            <p className="text-gray-300 text-lg md:text-xl mb-8 leading-relaxed">
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
                <h3 className="text-4xl font-bold text-white mb-4">Ascensores</h3>
                <p className="font-light text-gray-400 leading-relaxed mb-6">
                  Sistemas de elevación de última generación. Instalación, mantenimiento y modernización de ascensores residenciales, comerciales e industriales.
                </p>
                <Link href="/servicios" className="text-cyan-400 hover:text-white transition-all duration-300 font-bold uppercase text-sm tracking-wide">Ver más →</Link>
              </div>

              {/* ESCALERAS */}
              <div className="md:col-span-6 bg-gradient-to-br from-cyan-500/15 via-zinc-900/40 to-black/80 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-12 hover:scale-[1.01] transition-transform duration-500">
                <p className="text-[10px] text-cyan-400 tracking-[0.2em] uppercase mb-2">SERVICIO ESPECIALIZADO</p>
                <h3 className="text-4xl font-bold text-white mb-4">Escaleras Eléctricas</h3>
                <p className="font-light text-gray-400 leading-relaxed mb-6">
                  Soluciones eficientes en escaleras y pasillos rodantes. Diseño ergonómico, bajo consumo energético y máxima durabilidad.
                </p>
                <Link href="/servicios" className="text-cyan-400 hover:text-white transition-all duration-300 font-bold uppercase text-sm tracking-wide">Ver más →</Link>
              </div>

              {/* MISIÓN */}
              <div className="md:col-span-8 bg-gradient-to-br from-cyan-500/15 via-zinc-900/40 to-black/80 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10 hover:scale-[1.01] transition-transform duration-500">
                <h3 className="text-xl font-semibold text-zinc-300 mb-4 uppercase tracking-wide">MISIÓN</h3>
                <p className="text-base font-light text-gray-400 leading-relaxed">
                  Brindar soluciones confiables en transporte vertical, ofreciendo ascensores seguros, cómodos y eficientes, adaptados a cada espacio y necesidad. Nuestro compromiso es garantizar la satisfacción del cliente mediante un servicio responsable y un soporte técnico oportuno.
                </p>
              </div>

              {/* VISIÓN */}
              <div className="md:col-span-4 bg-gradient-to-br from-cyan-500/15 via-zinc-900/40 to-black/80 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10 hover:scale-[1.01] transition-transform duration-500">
                <h3 className="text-xl font-semibold text-zinc-300 mb-4 uppercase tracking-wide">VISIÓN</h3>
                <p className="text-base font-light text-gray-400 leading-relaxed">
                  Convertirnos en la empresa líder del transporte vertical en el mercado nacional, reconocidos como una organización sólida, rentable y modelo de otras organizaciones mediante nuestra búsqueda constante de la mejora continua.
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
