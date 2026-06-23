'use client';

export default function FichaTecnicaViewer({ fichaTecnica }) {
  if (!fichaTecnica) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-8 text-center">
        <p className="text-zinc-400">No hay ficha técnica disponible para este equipo</p>
      </div>
    );
  }

  const sections = [
    {
      title: 'Información General',
      fields: [
        { label: 'Código de Equipo', value: fichaTecnica.codigoEquipo },
        { label: 'Marca Original', value: fichaTecnica.marcaOriginal },
        { label: 'Modelo', value: fichaTecnica.modelo },
        { label: 'Año de Instalación', value: fichaTecnica.anoInstalacion },
        { label: 'País de Origen', value: fichaTecnica.paisOrigen },
        { label: 'Número de Paradas', value: fichaTecnica.numParadas },
      ],
    },
    {
      title: 'Sistema de Fuerza / Motor',
      fields: [
        { label: 'Tipo de Tracción', value: fichaTecnica.tipoTraccion },
        { label: 'Marca del Motor', value: fichaTecnica.marcaMotor },
        { label: 'Potencia (kW)', value: fichaTecnica.potenciaKW },
        { label: 'Voltaje de Alimentación', value: fichaTecnica.voltajeAlimentacion },
        { label: 'Marca Control Eléctrico', value: fichaTecnica.marcaControlElectrico },
        { label: 'Tipo de Tecnología', value: fichaTecnica.tipoTecnologia },
      ],
    },
    {
      title: 'Cables y Suspensión',
      fields: [
        { label: 'Número de Cables de Tracción', value: fichaTecnica.numCablesTraccion },
        { label: 'Diámetro de Cable (mm)', value: fichaTecnica.diametroCable },
        { label: 'Longitud Aproximada (m)', value: fichaTecnica.longitudAproximada },
      ],
    },
    {
      title: 'Cabina y Capacidades',
      fields: [
        { label: 'Capacidad (kilos)', value: fichaTecnica.capacidadKilos },
        { label: 'Capacidad (personas)', value: fichaTecnica.capacidadPersonas },
        { label: 'Ancho de Cabina (mm)', value: fichaTecnica.anchoCabina },
        { label: 'Alto de Cabina (mm)', value: fichaTecnica.altoCabina },
        { label: 'Profundidad de Cabina (mm)', value: fichaTecnica.profundidadCabina },
        { label: 'Acabado de Cabina', value: fichaTecnica.acabadoCabina },
        { label: 'Tipo de Piso', value: fichaTecnica.tipoPiso },
        { label: 'Tipo de Botonera COP', value: fichaTecnica.tipoBotoneraCOP },
      ],
    },
    {
      title: 'Puertas y Accesos',
      fields: [
        { label: 'Tipo de Apertura de Puerta', value: fichaTecnica.tipoAperturaPuerta },
        { label: 'Ancho de Paso de Puerta (mm)', value: fichaTecnica.anchoPasoPuerta },
        { label: 'Marca del Operador', value: fichaTecnica.marcaOperador },
        { label: 'Sistema de Seguridad de Puerta', value: fichaTecnica.sistemaSeguridadPuerta },
      ],
    },
    {
      title: 'Componentes Críticos de Seguridad',
      fields: [
        { label: 'Marca del Limitador', value: fichaTecnica.marcaLimitador },
        { label: 'Velocidad de Disparo (m/s)', value: fichaTecnica.velocidadDisparo },
        { label: 'Tipo de Paracaídas', value: fichaTecnica.tipoParacaidas },
        { label: 'Tipo de Amortiguadores', value: fichaTecnica.tipoAmortiguadores },
        { label: 'Tipo de Pesacargas', value: fichaTecnica.tipoPesacargas },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 text-xs text-zinc-400">
        <p>
          Actualizado:{' '}
          {new Date(fichaTecnica.updatedAt).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-950/50 p-6">
          <h3 className="text-lg font-semibold text-cyan-400">{section.title}</h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {section.fields.map((item) => (
              <div key={item.label}>
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{item.label}</p>
                <p className="mt-2 text-sm text-white">
                  {item.value ?? <span className="text-zinc-500 italic">No especificado</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
