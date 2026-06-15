import Navbar from '@/components/Navbar';

const proyectos = [
  {
    name: 'Edificio A',
    description: 'Ascensor premium instalado en torre corporativa con monitoreo continuo y acabados de alto estándar.',
    tags: ['Ascensor', 'Alta Velocidad', 'Mantenimiento'],
    images: [
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1475855581690-80accde3c6a4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    name: 'Edificio B',
    description: 'Modernización de sistema vertical con control inteligente y experiencia de usuario de clase mundial.',
    tags: ['Modernización', 'Control Inteligente', 'Seguridad'],
    images: [
      'https://images.unsplash.com/photo-1494524484466-3174838a9f75?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1460878938148-6dab93946f2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1494525421071-31b5b48271ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    name: 'Escalera C',
    description: 'Proyecto de movilidad peatonal con escaleras eléctricas eficientes para flujo continuo en centros comerciales.',
    tags: ['Escalera', 'Flujo Peatonal', 'Eficiencia'],
    images: [
      'https://images.unsplash.com/photo-1494525421071-31b5b48271ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    ],
  },
];

export default function EmpresaPage() {
  return (
    <div className="relative min-h-screen bg-[url('/fondo_img.jpg')] bg-cover bg-center bg-fixed text-white">
      <div className="absolute inset-0 bg-black/70" />
      <Navbar />

      <main className="relative pt-28 md:pt-36">
        <section className="px-6 pb-12">
          <div className="mx-auto max-w-7xl">
            <p className="text-cyan-400 uppercase tracking-[0.35em] text-xs mb-4">Nuestros Proyectos</p>
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

        <section className="space-y-16 px-6 pb-20">
          {proyectos.map((proyecto) => (
            <article key={proyecto.name} className="rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md shadow-xl shadow-cyan-500/10">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="max-w-3xl">
                  <h2 className="text-xl md:text-3xl font-bold text-white">{proyecto.name}</h2>
                  <p className="mt-3 text-zinc-400 leading-relaxed">{proyecto.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-cyan-300">
                    {proyecto.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 scrollbar-hide pb-4">
                {proyecto.images.map((image, index) => (
                  <div key={index} className="w-[300px] md:w-[450px] h-[220px] md:h-[300px] shrink-0 snap-center overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/20 transition-all duration-300 hover:scale-[1.02] hover:brightness-110">
                    <img
                      src={image}
                      alt={`${proyecto.name} imagen ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
