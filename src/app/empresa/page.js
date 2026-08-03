import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function EmpresaPage() {
  let proyectos = [];

  try {
    proyectos = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('Error loading projects for empresa page:', err);
  }

  return (
    <div className="relative min-h-screen bg-[url('/fondo_img.jpg')] bg-cover bg-center text-white md:bg-fixed">
      <div className="absolute inset-0 bg-black/70" />
      <Navbar />

      <main className="relative pt-28 md:pt-36">
        <section className="px-6 pb-12">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight max-w-4xl">
              Portafolio de instalaciones de transporte vertical de alto impacto.
            </h1>
            <p className="mt-4 max-w-3xl text-zinc-400 leading-relaxed">
              Descubre proyectos recientes que muestran nuestra experiencia en ascensores, escaleras eléctricas y soluciones integrales para edificios comerciales y residenciales.
            </p>
          </div>
        </section>

        <section className="px-6 pb-12">
          <div className="mx-auto max-w-7xl grid gap-6 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-10 backdrop-blur-md shadow-xl shadow-cyan-500/10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Misión</h2>
              <p className="text-zinc-400 leading-relaxed">
                Brindar soluciones confiables en transporte vertical, ofreciendo ascensores seguros, cómodos y eficientes, adaptados a cada espacio y necesidad. Nuestro compromiso es garantizar la satisfacción del cliente mediante un servicio responsable y un soporte técnico oportuno.
              </p>
            </div>
            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-10 backdrop-blur-md shadow-xl shadow-cyan-500/10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Visión</h2>
              <p className="text-zinc-400 leading-relaxed">
                Convertirnos en la empresa líder del transporte vertical en el mercado nacional, reconocidos como una organización sólida, rentable y modelo de otras organizaciones mediante nuestra búsqueda constante de la mejora continua.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 pb-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white">Instalaciones destacadas</h2>
              </div>
            </div>

            {proyectos.length === 0 ? (
              <div className="rounded-3xl border border-white/20 bg-white/10 p-8 text-zinc-300 backdrop-blur-md">
                Aún no hay proyectos publicados. Muy pronto verás aquí las imágenes reales de nuestras instalaciones.
              </div>
            ) : (
              <div className="flex overflow-x-auto scrollbar-hide gap-6 py-4 pr-6">
                {proyectos.map((proyecto) => (
                  <article
                    key={proyecto.id}
                    className="group shrink-0 w-[300px] md:w-[360px] rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:bg-white/15 hover:shadow-[0_10px_45px_rgba(34,211,238,0.2)]"
                  >
                    <div className="relative h-44 md:h-56 w-full overflow-hidden">
                      <Image
                        src={proyecto.imageUrl}
                        alt={proyecto.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 300px, 360px"
                      />
                    </div>
                    </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
