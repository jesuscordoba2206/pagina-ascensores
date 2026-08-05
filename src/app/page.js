import Navbar from '@/components/Navbar';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { buildPageMetadata, getBreadcrumbJsonLd } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Elevators ITV | Ingenieria en Transporte Vertical en Colombia',
  description:
    'Empresa especializada en transporte vertical en Colombia: ascensores, escaleras electricas, mantenimiento preventivo, modernizacion, reparacion y certificacion bajo normas NTC.',
  path: '/',
  keywords: [
    'ingenieria en transporte vertical',
    'empresa de ascensores en Colombia',
    'mantenimiento de escaleras electricas',
    'certificacion ONAC ascensores',
  ],
});

const breadcrumbJsonLd = getBreadcrumbJsonLd([{ name: 'Inicio', path: '/' }]);

export default function Home() {
  return (
    <>
      <JsonLd id="breadcrumbs-home-jsonld" data={breadcrumbJsonLd} />
      <div className="bg-black text-white">
        <Navbar />

        <section className="h-svh relative overflow-hidden bg-black -mt-24 md:-mt-28">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/fondo_video.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />

          <div className="relative h-full max-w-6xl mx-auto px-6 md:px-12 flex flex-col justify-center pt-28">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-none md:leading-tight max-w-3xl">
                Elevators Ingenieria en Transporte Vertical en Colombia
              </h1>

              <p className="text-base md:text-xl font-normal text-gray-400 mt-6 max-w-xl leading-relaxed mb-8">
                Expertos en soluciones verticales a nivel nacional.
                Innovacion y confiabilidad para sus equipos.
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

        <main className="relative min-h-screen bg-[url('/fondo_img.jpg')] bg-cover bg-center bg-no-repeat md:bg-fixed">
          <div className="absolute inset-0 bg-black/75" />

          <div className="relative z-10 py-32 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-6 bg-gradient-to-br from-cyan-500/15 via-zinc-900/40 to-black/80 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-12 hover:scale-[1.01] transition-transform duration-500">
                  <h3 className="text-3xl md:text-4xl font-bold tracking-wide text-white mb-4">Ascensores</h3>
                  <p className="text-sm md:text-base font-normal text-gray-300 leading-relaxed mb-6">
                    Sistemas de elevacion de ultima generacion. Instalacion, mantenimiento y modernizacion de ascensores residenciales, comerciales e industriales.
                  </p>
                  <Link href="/servicios#ascensores" className="text-cyan-400 hover:text-white transition-all duration-300 font-bold uppercase text-sm tracking-wide">Ver mas →</Link>
                </div>

                <div className="md:col-span-6 bg-gradient-to-br from-cyan-500/15 via-zinc-900/40 to-black/80 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-12 hover:scale-[1.01] transition-transform duration-500">
                  <h3 className="text-3xl md:text-4xl font-bold tracking-wide text-white mb-4">Escaleras Electricas</h3>
                  <p className="text-sm md:text-base font-normal text-gray-300 leading-relaxed mb-6">
                    Soluciones eficientes en escaleras y pasillos rodantes. Diseno ergonomico, bajo consumo energetico y maxima durabilidad.
                  </p>
                  <Link href="/servicios#escaleras" className="text-cyan-400 hover:text-white transition-all duration-300 font-bold uppercase text-sm tracking-wide">Ver mas →</Link>
                </div>

                <div className="md:col-span-8 bg-gradient-to-br from-cyan-500/15 via-zinc-900/40 to-black/80 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10 hover:scale-[1.01] transition-transform duration-500">
                  <h3 className="text-xl md:text-2xl font-bold tracking-wide text-cyan-400 uppercase mb-4 border-b border-cyan-400/20 pb-2">
                    ASESORIA
                  </h3>
                  <p className="text-sm md:text-base font-normal text-gray-300 leading-relaxed">
                    Tecnologia, seguridad y confianza en cada elevacion.
                    Brindamos soluciones integrales en ascensores y sistemas de transporte vertical: diseno, fabricacion, instalacion, modernizacion, mantenimiento, reparacion, inspeccion y certificacion, cumpliendo con la Norma NTC 5926-1, 2, 3 y 4 y estandares acreditados por ONAC.
                  </p>
                </div>

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
                © 2026 J_web. Ingenieria en Transporte Vertical.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
