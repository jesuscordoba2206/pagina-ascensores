'use client';

import { useState } from 'react';
import mockElevatorData from '@/data/mockElevatorData';

export default function DashboardPage() {
  const [currentRole, setCurrentRole] = useState('EMPRESA');
  const [selectedUnit, setSelectedUnit] = useState('ASCENSOR 1');

  const isClientRole = currentRole === 'CLIENTE';
  const isEnterpriseRole = currentRole === 'EMPRESA';

  const unitList = ['ASCENSOR 1', 'ASCENSOR 2', 'ESCALERA 1'];

  const handleRoleToggle = (role) => {
    setCurrentRole(role);
  };

  const handleUnitClick = (unit) => {
    setSelectedUnit(unit);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                {mockElevatorData.general.buildingName}
              </h1>
              <p className="mt-3 text-lg md:text-2xl text-cyan-400 max-w-3xl">
                {mockElevatorData.general.address}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-3">
              <button
                type="button"
                onClick={() => handleRoleToggle('CLIENTE')}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition duration-300 ${
                  isClientRole
                    ? 'border border-cyan-400 bg-cyan-500/15 text-cyan-300'
                    : 'border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-cyan-400 hover:text-white'
                }`}
              >
                CLIENTE
              </button>
              <button
                type="button"
                onClick={() => handleRoleToggle('EMPRESA')}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition duration-300 ${
                  isEnterpriseRole
                    ? 'border border-cyan-400 bg-cyan-500/15 text-cyan-300'
                    : 'border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-cyan-400 hover:text-white'
                }`}
              >
                EMPRESA
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-6 shadow-xl shadow-cyan-500/10 backdrop-blur-md transition duration-300 hover:border-cyan-400/60">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-400">
                  FICHA TÉCNICA
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">
                  Equipos
                </h2>
              </div>
              {isEnterpriseRole && (
                <div className="flex gap-2 text-cyan-400">
                  <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 transition duration-300 hover:bg-cyan-500/15">
                    +
                  </button>
                  <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 transition duration-300 hover:bg-cyan-500/15">
                    ✎
                  </button>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-4">
              {unitList.map((unit) => {
                const isActive = selectedUnit === unit;
                return (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => handleUnitClick(unit)}
                    className={`w-full rounded-3xl border px-5 py-4 text-left transition duration-300 ${
                      isActive
                        ? 'border-cyan-400 bg-cyan-500/10 text-white shadow-[0_0_0_1px_rgba(0,229,255,0.2)]'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-200 hover:border-cyan-400 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{unit}</span>
                      <span className="text-sm text-cyan-300">Ver ficha</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 rounded-[1.75rem] border border-zinc-800 bg-zinc-950/60 p-5">
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Selección actual
              </p>
              <p className="mt-3 text-lg font-semibold text-white">
                {selectedUnit}
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                {isClientRole
                  ? 'Accede a la ficha técnica en modo lectura.'
                  : 'Gestiona los datos del equipo y revisa sus especificaciones.'}
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-6 shadow-xl shadow-cyan-500/10 backdrop-blur-md transition duration-300 hover:border-cyan-400/60">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-400">
                  INTERVENCIONES TÉCNICAS
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">
                  Reportes PDF
                </h2>
              </div>
              {isEnterpriseRole && (
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 transition duration-300 hover:bg-cyan-500/15">
                  +
                </span>
              )}
            </div>

            <p className="mt-6 text-sm leading-7 text-zinc-400">
              Descarga y revisa los reportes en PDF de las últimas intervenciones técnicas realizadas en el edificio.
            </p>

            <button
              type="button"
              className={`mt-8 flex w-full items-center justify-center gap-3 rounded-3xl border px-5 py-4 text-sm font-semibold transition duration-300 ${
                isClientRole
                  ? 'border-cyan-500/40 bg-zinc-950 text-cyan-300 hover:border-cyan-400'
                  : 'border-cyan-400 bg-cyan-500/10 text-white hover:bg-cyan-500/20'
              }`}
            >
              <span className="text-cyan-300">📄</span>
              {isClientRole ? 'Ver PDF' : 'REPORTES PDF'}
            </button>
          </section>

          <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-6 shadow-xl shadow-cyan-500/10 backdrop-blur-md transition duration-300 hover:border-cyan-400/60">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-400">
                  REPORTES DE MANTENIMIENTO
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">
                  Historial operativo
                </h2>
              </div>
              {isEnterpriseRole && (
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 transition duration-300 hover:bg-cyan-500/15">
                  ✎
                </span>
              )}
            </div>

            <p className="mt-6 text-sm leading-7 text-zinc-400">
              Consulta el historial de operación, tiempos y eventos críticos para cada equipo de transporte vertical.
            </p>

            <button
              type="button"
              className={`mt-8 flex w-full items-center justify-center gap-3 rounded-3xl border px-5 py-4 text-sm font-semibold transition duration-300 ${
                isClientRole
                  ? 'border-cyan-500/40 bg-zinc-950 text-cyan-300 hover:border-cyan-400'
                  : 'border-cyan-400 bg-cyan-500/10 text-white hover:bg-cyan-500/20'
              }`}
            >
              <span className="text-cyan-300">⏱️</span>
              {isClientRole ? 'Ver historial operativo' : 'HISTORIAL OPERATIVO'}
            </button>
          </section>
        </div>

        <div className="mt-10 rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-6 text-sm text-zinc-300">
          <p className="font-semibold text-white">Rol actual:</p>
          <p className="mt-2 text-cyan-300">{currentRole}</p>
          <p className="mt-3 text-zinc-400">
            {isClientRole
              ? 'Los clientes pueden visualizar y descargar reportes en modo solo lectura.'
              : 'Las empresas pueden gestionar datos, editar secciones y generar reportes.'}
          </p>
        </div>
      </main>
    </div>
  );
}
