'use client';

import { useState, useEffect } from 'react';

export default function FichaTecnicaForm({ equipmentId, initialData = null, onSuccess = null }) {
  const [formData, setFormData] = useState({
    codigoEquipo: '',
    marcaOriginal: '',
    modelo: '',
    anoInstalacion: '',
    paisOrigen: '',
    numParadas: '',
    tipoTraccion: '',
    marcaMotor: '',
    potenciaKW: '',
    voltajeAlimentacion: '',
    marcaControlElectrico: '',
    tipoTecnologia: '',
    numCablesTraccion: '',
    diametroCable: '',
    longitudAproximada: '',
    capacidadKilos: '',
    capacidadPersonas: '',
    anchoCabina: '',
    altoCabina: '',
    profundidadCabina: '',
    acabadoCabina: '',
    tipoPiso: '',
    tipoBotoneraCOP: '',
    tipoAperturaPuerta: '',
    anchoPasoPuerta: '',
    marcaOperador: '',
    sistemaSeguridadPuerta: '',
    marcaLimitador: '',
    velocidadDisparo: '',
    tipoParacaidas: '',
    tipoAmortiguadores: '',
    tipoPesacargas: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const method = initialData?.id ? 'PUT' : 'POST';
      const response = await fetch('/api/ficha-tecnica', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipmentId, ...formData }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || `Error HTTP ${response.status}`);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      if (onSuccess) {
        const result = await response.json();
        onSuccess(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      title: 'Información General',
      fields: ['codigoEquipo', 'marcaOriginal', 'modelo', 'anoInstalacion', 'paisOrigen', 'numParadas'],
    },
    {
      title: 'Sistema de Fuerza / Motor',
      fields: ['tipoTraccion', 'marcaMotor', 'potenciaKW', 'voltajeAlimentacion', 'marcaControlElectrico', 'tipoTecnologia'],
    },
    {
      title: 'Cables y Suspensión',
      fields: ['numCablesTraccion', 'diametroCable', 'longitudAproximada'],
    },
    {
      title: 'Cabina y Capacidades',
      fields: ['capacidadKilos', 'capacidadPersonas', 'anchoCabina', 'altoCabina', 'profundidadCabina', 'acabadoCabina', 'tipoPiso', 'tipoBotoneraCOP'],
    },
    {
      title: 'Puertas y Accesos',
      fields: ['tipoAperturaPuerta', 'anchoPasoPuerta', 'marcaOperador', 'sistemaSeguridadPuerta'],
    },
    {
      title: 'Componentes Críticos de Seguridad',
      fields: ['marcaLimitador', 'velocidadDisparo', 'tipoParacaidas', 'tipoAmortiguadores', 'tipoPesacargas'],
    },
  ];

  const fieldLabels = {
    codigoEquipo: 'Código de Equipo',
    marcaOriginal: 'Marca Original',
    modelo: 'Modelo',
    anoInstalacion: 'Año de Instalación',
    paisOrigen: 'País de Origen',
    numParadas: 'Número de Paradas',
    tipoTraccion: 'Tipo de Tracción',
    marcaMotor: 'Marca del Motor',
    potenciaKW: 'Potencia (kW)',
    voltajeAlimentacion: 'Voltaje de Alimentación',
    marcaControlElectrico: 'Marca Control Eléctrico',
    tipoTecnologia: 'Tipo de Tecnología',
    numCablesTraccion: 'Número de Cables de Tracción',
    diametroCable: 'Diámetro de Cable (mm)',
    longitudAproximada: 'Longitud Aproximada (m)',
    capacidadKilos: 'Capacidad (kilos)',
    capacidadPersonas: 'Capacidad (personas)',
    anchoCabina: 'Ancho de Cabina (mm)',
    altoCabina: 'Alto de Cabina (mm)',
    profundidadCabina: 'Profundidad de Cabina (mm)',
    acabadoCabina: 'Acabado de Cabina',
    tipoPiso: 'Tipo de Piso',
    tipoBotoneraCOP: 'Tipo de Botonera COP',
    tipoAperturaPuerta: 'Tipo de Apertura de Puerta',
    anchoPasoPuerta: 'Ancho de Paso de Puerta (mm)',
    marcaOperador: 'Marca del Operador',
    sistemaSeguridadPuerta: 'Sistema de Seguridad de Puerta',
    marcaLimitador: 'Marca del Limitador',
    velocidadDisparo: 'Velocidad de Disparo (m/s)',
    tipoParacaidas: 'Tipo de Paracaídas',
    tipoAmortiguadores: 'Tipo de Amortiguadores',
    tipoPesacargas: 'Tipo de Pesacargas',
  };

  const numericFields = [
    'anoInstalacion',
    'numParadas',
    'potenciaKW',
    'numCablesTraccion',
    'diametroCable',
    'longitudAproximada',
    'capacidadKilos',
    'capacidadPersonas',
    'anchoCabina',
    'altoCabina',
    'profundidadCabina',
    'anchoPasoPuerta',
    'velocidadDisparo',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-500 bg-red-50 p-4 text-red-700 sticky top-0 z-20">
          <p className="font-semibold">⚠ Error:</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-500 bg-green-50 p-4 text-green-700 sticky top-0 z-20">
          <p className="font-semibold">✓ Ficha técnica guardada correctamente</p>
        </div>
      )}

      {sections.map((section) => (
        <div key={section.title} className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-950/50 p-6">
          <h3 className="text-lg font-semibold text-cyan-400">{section.title}</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {section.fields.map((field) => (
              <div key={field}>
                <label className="block text-sm text-zinc-300">
                  <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">{fieldLabels[field]}</span>
                  <input
                    type={numericFields.includes(field) ? 'number' : 'text'}
                    name={field}
                    value={formData[field] ?? ''}
                    onChange={handleInputChange}
                    step={numericFields.includes(field) ? '0.01' : undefined}
                    className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-2 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                    placeholder={`Ingresa ${fieldLabels[field].toLowerCase()}`}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="sticky bottom-0 bg-zinc-950/95 border-t border-zinc-800 pt-4 mt-8 -mx-6 px-6 py-4 flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-3xl bg-cyan-500 px-6 py-3 font-semibold text-zinc-950 hover:bg-cyan-400 disabled:opacity-50 transition-colors"
        >
          {loading ? '⏳ Guardando...' : initialData?.id ? '✓ Actualizar' : '+ Crear'} Ficha Técnica
        </button>
      </div>
    </form>
  );
}
