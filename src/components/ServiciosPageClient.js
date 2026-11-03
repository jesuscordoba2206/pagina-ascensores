'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { ArrowUpRight, Clock3, Cog, Hammer, Wrench } from 'lucide-react';

const categories = {
  ascensores: {
    label: 'Ascensores',
    title: 'Servicios de ascensores en Colombia.',
    cards: [
      {
        title: 'Mantenimiento Preventivo',
        subtitle: 'Seguridad en cada recorrido',
        points: ['Lubricación de componentes', 'Calibración de sistemas', 'Norma NTC 2503'],
        image: '/mantenimientoAscensor.jpg',
        icon: Cog,
      },
      {
        title: 'Instalación y Modernización',
        subtitle: 'Tecnología que eleva sus espacios',
        points: ['Cabinas a medida', 'Eficiencia energética', 'Cumplimiento de normas NTC'],
        image: '/instalacionAscensor.jpg',
        icon: Wrench,
      },
      {
        title: 'Reparaciones y Adecuación Normativa',
        subtitle: 'Confianza que se mantiene en movimiento',
        points: ['Subsanación de hallazgos ONAC', 'Sistemas de paracaídas', 'Norma NTC 5926-1'],
        image: '/reparacionAscensor.jpg',
        icon: Hammer,
      },
      {
        title: 'Atención de Emergencias 24/7',
        subtitle: 'Siempre cerca cuando nos necesita',
        points: ['Rescate de usuarios', 'Protocolos de atención', 'Norma EN 81-28'],
        image: '/emergenciaAscensor.jpg',
        icon: Clock3,
      },
    ],
  },
  escaleras: {
    label: 'Escaleras eléctricas',
    title: 'Servicios de escaleras eléctricas en Colombia.',
    cards: [
      {
        title: 'Mantenimiento Preventivo',
        subtitle: 'Continuidad para espacios en movimiento',
        points: ['Inspección de cadenas', 'Sistemas de transmisión', 'Seguridad de peines'],
        image: '/mantenimientoEscalera.jpg',
        icon: Cog,
      },
      {
        title: 'Modernización y Optimización',
        subtitle: 'Eficiencia para un mejor recorrido',
        points: ['Actualización de sistemas de tracción', 'Iluminación LED de guía', 'Ahorro energético'],
        image: '/instalacionEscalera.jpg',
        icon: Wrench,
      },
      {
        title: 'Reparaciones Especializadas',
        subtitle: 'Precisión en cada intervención',
        points: ['Corrección de fallas mecánicas', 'Sustitución de peldaños', 'Ajuste de sistemas de parada de emergencia'],
        image: '/reparacionEscalera.jpg',
        icon: Hammer,
      },
      {
        title: 'Soporte Técnico y Emergencias',
        subtitle: 'Respuesta oportuna para mantener el flujo',
        points: ['Atención prioritaria ante paradas imprevistas', 'Soporte en centros comerciales', 'Atención en espacios de alto flujo'],
        image: '/emergenciaEscalera.jpg',
        icon: Clock3,
      },
    ],
  },
};

function categoryFromHash() {
  if (typeof window === 'undefined') return 'ascensores';
  const hash = window.location.hash.replace('#', '').toLowerCase();
  return hash === 'escaleras' ? 'escaleras' : 'ascensores';
}

export default function ServiciosPageClient() {
  const [activeCategory, setActiveCategory] = useState('ascensores');
  const category = categories[activeCategory];

  useEffect(() => {
    const syncFromHash = () => {
      setActiveCategory(categoryFromHash());
      window.scrollTo(0, 0);
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const changeCategory = (nextCategory) => {
    setActiveCategory(nextCategory);
    window.history.replaceState(null, '', `/servicios#${nextCategory}`);
  };

  return (
    <div className="relative min-h-screen bg-[url('/fondo_img.jpg')] bg-cover bg-center bg-no-repeat text-white md:bg-fixed">
      <span id="ascensores" aria-hidden="true" className="absolute -top-24 h-px w-px md:-top-28" />
      <span id="escaleras" aria-hidden="true" className="absolute -top-24 h-px w-px md:-top-28" />
      <div className="absolute inset-0 bg-zinc-950/85" />

      <div className="relative">
        <Navbar />

        <main className="px-5 pb-20 pt-24 sm:px-8 md:pt-28 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <header className="mb-10 md:mb-14">
              <div className="mb-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                <span className="h-px w-9 bg-cyan-400" />
                Ingeniería en transporte vertical
              </div>

              <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                    {category.title}
                  </h1>
                  <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-300 sm:text-base">
                    Soluciones especializadas para mantener sus espacios seguros y en movimiento.
                  </p>
                </div>

                <div aria-label="Tipo de servicio" className="inline-flex w-full rounded-2xl border border-white/10 bg-zinc-950/65 p-1.5 backdrop-blur-xl sm:w-fit">
                  {Object.entries(categories).map(([key, item]) => (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={activeCategory === key}
                      onClick={() => changeCategory(key)}
                      className={`flex-1 rounded-xl px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 sm:flex-none sm:px-5 sm:text-xs ${
                        activeCategory === key
                          ? 'bg-cyan-400 text-zinc-950 shadow-[0_0_24px_rgba(34,211,238,0.2)]'
                          : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </header>

            <div key={activeCategory} className="servicios-grid grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
              {category.cards.map((card, index) => {
                const Icon = card.icon;
                const subject = encodeURIComponent(`Consulta: ${card.title} - ${category.label}`);

                return (
                  <article
                    key={card.title}
                    className={`group relative isolate flex min-h-[350px] flex-col overflow-hidden rounded-[1.75rem] border border-white/15 bg-zinc-900/70 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-colors duration-300 hover:border-cyan-400/40 sm:p-8 ${
                      index === 0 || index === 3 ? 'md:col-span-7' : 'md:col-span-5'
                    }`}
                  >
                    <Image
                      src={card.image}
                      alt=""
                      fill
                      sizes="(max-width: 767px) 100vw, (max-width: 1280px) 60vw, 750px"
                      className="-z-20 object-cover opacity-30 transition-transform duration-700 motion-safe:group-hover:scale-105"
                    />
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-zinc-950/95 via-zinc-950/75 to-zinc-950/45" />

                    <div className="mb-7 flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-300">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <span className="text-xs font-medium tracking-[0.2em] text-white/50">0{index + 1} / 04</span>
                    </div>

                    <h2 className="max-w-lg text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{card.title}</h2>
                    <p className="mt-2 text-sm italic text-cyan-100/75">{card.subtitle}</p>

                    <ul className="mt-6 space-y-2.5 text-sm leading-relaxed text-zinc-200">
                      {card.points.map((point) => (
                        <li key={point} className="flex items-start gap-3">
                          <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cyan-400" />
                          {point}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto flex justify-end pt-7">
                      <a
                        href={`mailto:elevatorscompanyantioquia@gmail.com?subject=${subject}`}
                        aria-label={`Consultar sobre ${card.title} de ${category.label}`}
                        className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:border-cyan-300 hover:bg-cyan-400 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                      >
                        Consultar servicio <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </main>

        <footer className="border-t border-white/10 bg-black/80 px-6 py-12">
          <div className="mx-auto max-w-6xl text-center">
            <p className="text-sm tracking-wide text-gray-500">© 2026 J_web. Ingeniería en Transporte Vertical.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
