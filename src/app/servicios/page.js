'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Cog, Wrench, Hammer, Clock3 } from 'lucide-react';

const categories = {
  ascensores: [
    {
      title: 'Mantenimiento Preventivo',
      description: 'Garantizamos la continuidad operativa y la seguridad de sus pasajeros bajo los lineamientos de la norma NTC 2503. Ejecutamos rutinas mensuales estrictas de lubricación de guías, calibración de frenos de máquina y revisión de cables de tracción, preparando su equipo para superar con éxito la certificación anual obligatoria en Colombia.',
      icon: Cog,
    },
    {
      title: 'Instalación y Modernización',
      description: 'Diseño y montaje de sistemas de transporte vertical de última tecnología, cumpliendo con los estándares internacionales de construcción y las normas NTC 2769-1 y NTC 2769-2. Adaptamos cabinas modernas con criterios de accesibilidad universal según la NTC 4349, optimizando el espacio, el confort y el consumo energético.',
      icon: Wrench,
    },
    {
      title: 'Reparaciones y Adecuación Normativa',
      description: 'Sustitución de componentes críticos y corrección de fallas mecánicas o eléctricas con repuestos de alta trazabilidad. Nos especializamos en la subsanación inmediata de hallazgos detectados por organismos de inspección acreditados (ONAC), instalando cortinas infrarrojas, operadores de puerta avanzados y sistemas de paracaídas según la NTC 5926-1.',
      icon: Hammer,
    },
    {
      title: 'Atención de Emergencias 24/7',
      description: 'Soporte técnico prioritario y rescate de usuarios disponible las 24 horas, los 365 días del año. Minimizamos los tiempos de respuesta ante atrapamientos o fallas críticas, implementando protocolos avanzados y sistemas de comunicación bidireccional en cabina bajo el estándar de seguridad EN 81-28.',
      icon: Clock3,
    },
  ],
  escaleras: [
    {
      title: 'Mantenimiento Preventivo',
      description: 'Preservamos la vida útil y el flujo continuo de usuarios en zonas de alto tráfico. Realizamos rutinas periódicas de limpieza técnica, alineación de cadenas de arrastre, revisión de sistemas motrices y verificación de sensores de seguridad, alineados estrictamente con las exigencias preventivas de la norma NTC 5926-2.',
      icon: Cog,
    },
    {
      title: 'Instalación y Montaje Técnico',
      description: 'Planificación, ingeniería y ensamble de escaleras mecánicas y andenes móviles de alta resistencia para proyectos comerciales o residenciales. Aseguramos que la inclinación, la velocidad nominal y los pasamanos cumplan rigurosamente con los códigos de seguridad estructural y los parámetros de ingeniería nacionales.',
      icon: Wrench,
    },
    {
      title: 'Reparaciones y Seguridad Activa',
      description: 'Intervención correctiva especializada en sistemas de peldaños, peines de entrada y pasamanos. Corregimos desviaciones mecánicas y actualizamos los dispositivos de seguridad activa (sensores de rotura de cadena, botones de parada de emergencia y demarcación de escalones) para garantizar la certificación obligatoria y evitar accidentes.',
      icon: Hammer,
    },
    {
      title: 'Monitoreo y Soporte 24/7',
      description: 'Atención técnica inmediata ante paradas imprevistas o bloqueos de seguridad en el sistema de transporte. Nuestro equipo de técnicos certificados está listo para intervenir de manera oportuna, restableciendo el flujo peatonal de forma segura y minimizando el impacto operativo en su edificio o centro comercial.',
      icon: Clock3,
    },
  ],
};

export default function ServiciosPage() {
  const [activeCategory, setActiveCategory] = useState('ascensores');
  const cards = activeCategory === 'ascensores' ? categories.ascensores : categories.escaleras;

  return (
    <div className="relative min-h-screen bg-[url('/fondo_img.jpg')] bg-cover bg-center bg-no-repeat text-white md:bg-fixed">
      <div className="absolute inset-0 bg-black/75 z-0" />

      <div className="relative z-10">
        <Navbar />

        <section className="pt-28 pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12 text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">Soluciones diseñadas para el movimiento vertical.</h1>
              <p className="mx-auto mt-6 max-w-2xl text-zinc-400 font-light leading-relaxed">
                Selecciona la categoría y descubre nuestros servicios especializados para ascensores y escaleras eléctricas.
              </p>
            </div>

            <div className="mb-10 flex flex-col gap-4 items-center sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setActiveCategory('ascensores')}
                className={`min-w-[260px] rounded-full px-10 py-6 text-lg font-black tracking-widest transition-all duration-300 sm:px-12 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 ${
                  activeCategory === 'ascensores'
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                    : 'text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                ASCENSORES
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('escaleras')}
                className={`min-w-[260px] rounded-full px-10 py-6 text-lg font-black tracking-widest transition-all duration-300 sm:px-12 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 ${
                  activeCategory === 'escaleras'
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                    : 'text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                ESCALERAS ELÉCTRICAS
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.title}
                    type="button"
                    className="group w-full text-left bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-[2.5rem] p-10 cursor-pointer hover:-translate-y-1 hover:border-cyan-400 transition-all duration-300 h-full"
                  >
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-[1.75rem] bg-cyan-500/10 text-cyan-400 shadow-[0_15px_30px_-20px_rgba(14,165,233,0.7)]">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">{card.title}</h2>
                    <p className="text-zinc-400 font-light leading-relaxed">
                      {card.description}
                    </p>
                  </button>
                );
              })}
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
