import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="h-screen relative overflow-hidden">
        {/* VIDEO */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/video_fondo.mp4" type="video/mp4" />
        </video>

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* CONTENIDO */}
        <div className="relative h-full max-w-6xl mx-auto px-6 md:px-12 flex flex-col justify-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
              J_web: Ingeniería en Transporte Vertical
            </h1>

            <p className="text-gray-300 text-lg md:text-xl mb-8 leading-relaxed">
              Expertos en ascensores y escaleras eléctricas en Colombia.
              Soluciones innovadoras y confiables para el transporte vertical.
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

      {/* SERVICIOS */}
      <section className="py-32 px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-16 text-center">
            Nuestros Servicios
          </h2>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Ascensores */}
            <div className="pb-6 border-b border-gray-800">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ascensores
              </h3>

              <p className="text-gray-400 leading-relaxed">
                Sistemas de elevación de última generación. Instalación,
                mantenimiento y modernización de ascensores residenciales,
                comerciales e industriales.
              </p>

              <Link
                href="/servicios"
                className="inline-block mt-6 text-cyan-400 hover:text-white transition-all duration-300 font-medium uppercase text-sm tracking-wide"
              >
                Ver más →
              </Link>
            </div>

            {/* Escaleras */}
            <div className="pb-6 border-b border-gray-800">
              <h3 className="text-2xl font-bold text-white mb-4">
                Escaleras Eléctricas
              </h3>

              <p className="text-gray-400 leading-relaxed">
                Soluciones eficientes en escaleras y pasillos rodantes. Diseño
                ergonómico, bajo consumo energético y máxima durabilidad.
              </p>

              <Link
                href="/servicios"
                className="inline-block mt-6 text-cyan-400 hover:text-white transition-all duration-300 font-medium uppercase text-sm tracking-wide"
              >
                Ver más →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CORPORATIVO */}
      <section className="py-32 px-6 bg-zinc-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-16">
            Sobre J_web
          </h2>

          <div className="space-y-12">
            {/* Misión */}
            <div>
              <h3 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-wide">
                Misión
              </h3>

              <p className="text-gray-400 text-lg leading-relaxed">
                Proporcionar soluciones integrales en transporte vertical que
                combinen innovación tecnológica, seguridad y sostenibilidad.
              </p>
            </div>

            {/* Visión */}
            <div>
              <h3 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-wide">
                Visión
              </h3>

              <p className="text-gray-400 text-lg leading-relaxed">
                Ser líderes en soluciones de transporte vertical en Colombia,
                reconocidos por nuestra excelencia técnica e innovación.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16">
            <Link
              href="/login"
              className="inline-block bg-cyan-400 text-black px-8 py-3 rounded-md font-medium uppercase tracking-wide transition-all duration-300 hover:opacity-80"
            >
              Ingresar al Portal
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black border-t border-gray-800 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-sm tracking-wide">
            © 2026 J_web. Ingeniería en Transporte Vertical.
          </p>
        </div>
      </footer>
    </div>
  );
}