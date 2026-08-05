'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Cog, Wrench, Hammer, Clock3 } from 'lucide-react';

const categories = {
  ascensores: [
    {
      title: 'Mantenimiento Preventivo',
      description: 'Garantizamos la continuidad operativa y la seguridad de sus pasajeros bajo los lineamientos de la norma NTC 2503. Ejecutamos rutinas mensuales estrictas de lubricacion de guias, calibracion de frenos de maquina y revision de cables de traccion, preparando su equipo para superar con exito la certificacion anual obligatoria en Colombia.',
      icon: Cog,
    },
    {
      title: 'Instalacion y Modernizacion',
      description: 'Diseno y montaje de sistemas de transporte vertical de ultima tecnologia, cumpliendo con los estandares internacionales de construccion y las normas NTC 2769-1 y NTC 2769-2. Adaptamos cabinas modernas con criterios de accesibilidad universal segun la NTC 4349, optimizando el espacio, el confort y el consumo energetico.',
      icon: Wrench,
    },
    {
      title: 'Reparaciones y Adecuacion Normativa',
      description: 'Sustitucion de componentes criticos y correccion de fallas mecanicas o electricas con repuestos de alta trazabilidad. Nos especializamos en la subsanacion inmediata de hallazgos detectados por organismos de inspeccion acreditados (ONAC), instalando cortinas infrarrojas, operadores de puerta avanzados y sistemas de paracaidas segun la NTC 5926-1.',
      icon: Hammer,
    },
    {
      title: 'Atencion de Emergencias 24/7',
      description: 'Soporte tecnico prioritario y rescate de usuarios disponible las 24 horas, los 365 dias del ano. Minimizamos los tiempos de respuesta ante atrapamientos o fallas criticas, implementando protocolos avanzados y sistemas de comunicacion bidireccional en cabina bajo el estandar de seguridad EN 81-28.',
      icon: Clock3,
    },
  ],
  escaleras: [
    {
      title: 'Mantenimiento Preventivo',
      description: 'Preservamos la vida util y el flujo continuo de usuarios en zonas de alto trafico. Realizamos rutinas periodicas de limpieza tecnica, alineacion de cadenas de arrastre, revision de sistemas motrices y verificacion de sensores de seguridad, alineados estrictamente con las exigencias preventivas de la norma NTC 5926-2.',
      icon: Cog,
    },
    {
      title: 'Instalacion y Montaje Tecnico',
      description: 'Planificacion, ingenieria y ensamble de escaleras mecanicas y andenes moviles de alta resistencia para proyectos comerciales o residenciales. Aseguramos que la inclinacion, la velocidad nominal y los pasamanos cumplan rigurosamente con los codigos de seguridad estructural y los parametros de ingenieria nacionales.',
      icon: Wrench,
    },
    {
      title: 'Reparaciones y Seguridad Activa',
      description: 'Intervencion correctiva especializada en sistemas de peldanos, peines de entrada y pasamanos. Corregimos desviaciones mecanicas y actualizamos los dispositivos de seguridad activa (sensores de rotura de cadena, botones de parada de emergencia y demarcacion de escalones) para garantizar la certificacion obligatoria y evitar accidentes.',
      icon: Hammer,
    },
    {
      title: 'Monitoreo y Soporte 24/7',
      description: 'Atencion tecnica inmediata ante paradas imprevistas o bloqueos de seguridad en el sistema de transporte. Nuestro equipo de tecnicos certificados esta listo para intervenir de manera oportuna, restableciendo el flujo peatonal de forma segura y minimizando el impacto operativo en su edificio o centro comercial.',
      icon: Clock3,
    },
  ],
};

function categoryFromHash() {
  if (typeof window === 'undefined') return 'ascensores';
  const hash = window.location.hash.replace('#', '').toLowerCase();
  return hash === 'escaleras' ? 'escaleras' : 'ascensores';
}

export default function ServiciosPageClient() {
  const [activeCategory, setActiveCategory] = useState('ascensores');
  const cards = activeCategory === 'ascensores' ? categories.ascensores : categories.escaleras;

  useEffect(() => {
    const syncFromHash = () => {
      setActiveCategory(categoryFromHash());
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const changeCategory = (category) => {
    setActiveCategory(category);
    window.history.replaceState(null, '', `/servicios#${category}`);
  };

  return (
    <div className="relative min-h-screen bg-[url('/fondo_img.jpg')] bg-cover bg-center bg-no-repeat text-white md:bg-fixed">
      <div className="absolute inset-0 bg-black/75 z-0" />

      <div className="relative z-10">
        <Navbar />

        <section className="pt-28 pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12 text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">Servicios de ascensores y escaleras electricas en Colombia.</h1>
              <p className="mx-auto mt-6 max-w-2xl text-zinc-400 font-light leading-relaxed">
                Selecciona la categoria y descubre nuestros servicios especializados para ascensores y escaleras electricas.
              </p>
            </div>

            <div className="mb-10 flex flex-col gap-4 items-center sm:flex-row sm:justify-center">
              <button
                id="ascensores"
                type="button"
                onClick={() => changeCategory('ascensores')}
                className={`min-w-[260px] rounded-full px-10 py-6 text-lg font-black tracking-widest transition-all duration-300 sm:px-12 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 ${
                  activeCategory === 'ascensores'
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                    : 'text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                ASCENSORES
              </button>
              <button
                id="escaleras"
                type="button"
                onClick={() => changeCategory('escaleras')}
                className={`min-w-[260px] rounded-full px-10 py-6 text-lg font-black tracking-widest transition-all duration-300 sm:px-12 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 ${
                  activeCategory === 'escaleras'
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                    : 'text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                ESCALERAS ELECTRICAS
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <article
                    key={card.title}
                    className="group w-full text-left bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-[2.5rem] p-10 hover:-translate-y-1 hover:border-cyan-400 transition-all duration-300 h-full"
                  >
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-[1.75rem] bg-cyan-500/10 text-cyan-400 shadow-[0_15px_30px_-20px_rgba(14,165,233,0.7)]">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">{card.title}</h2>
                    <p className="text-zinc-400 font-light leading-relaxed">
                      {card.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <footer className="bg-black border-t border-gray-800 py-12 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-gray-500 text-sm tracking-wide">© 2026 J_web. Ingenieria en Transporte Vertical.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
