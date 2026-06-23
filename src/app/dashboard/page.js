"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/DashboardNavbar';

function Field({ label, value, editable }) {
  return (
    <div>
      <div className="text-xs text-zinc-400">{label}</div>
      {editable ? (
        <input
          defaultValue={String(value ?? '')}
          className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
        />
      ) : (
        <div className="mt-1 text-sm text-zinc-200">{String(value ?? '-')}</div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [sessionRole, setSessionRole] = useState('CLIENTE');
  const [currentRole, setCurrentRole] = useState('CLIENTE');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [equipments, setEquipments] = useState([]);
  const [buildingInfo, setBuildingInfo] = useState({ buildingName: '', address: '' });
  const [loading, setLoading] = useState(true);

  const isClientRole = currentRole === 'CLIENTE';
  const isEnterpriseRole = currentRole === 'EMPRESA';
  const isSessionEnterprise = sessionRole === 'EMPRESA';

  const unitList = equipments.map((e) => e.internalCode || e.id);

  const handleRoleToggle = (role) => {
    setCurrentRole(role);
  };

  const handleUnitClick = (unit) => {
    setSelectedUnit(unit);
    const found = equipments.find((e) => (e.internalCode || e.id) === unit);
    if (found) setBuildingInfo({ buildingName: found.buildingName || '', address: found.address || '' });
  };

  const selectedEquipment = equipments.find((e) => (e.internalCode || e.id) === selectedUnit) || {};

  useEffect(() => {
    fetch('/api/session')
      .then((r) => r.json())
      .then((data) => {
        const role = data?.role || 'CLIENTE';
        setSessionRole(role);
        setCurrentRole(role);
        if (role === 'EMPRESA') {
          router.replace('/dashboard/empresa');
        } else {
          router.replace('/dashboard/cliente');
        }
      })
      .catch(() => {
        router.replace('/dashboard/cliente');
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <DashboardNavbar />
          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/70 p-8 text-center shadow-xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Cargando</p>
            <h1 className="mt-6 text-3xl font-semibold">Redirigiendo al dashboard adecuado...</h1>
            <p className="mt-4 text-zinc-300">Detectando tu rol de sesión y cargando el panel correcto.</p>
          </div>
        </div>
      </div>
    );
  }

  return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DashboardNavbar />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              {buildingInfo.buildingName}
            </h1>
            <p className="mt-3 text-lg md:text-2xl text-cyan-400 max-w-3xl">
              {buildingInfo.address}
            </p>
          </div>

          {isSessionEnterprise && (
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
          )}
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

          {/* Detailed ficha técnica panel - central column becomes a larger area on mobile */}
          <section className="col-span-1 lg:col-span-3 mt-6 rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-6 shadow-xl shadow-cyan-500/10 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Ficha Técnica Detallada — {selectedUnit}</h3>
              {currentRole === 'EMPRESA' && (
                <div className="flex gap-3">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-cyan-300"
                    >
                      Editar ficha
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-emerald-300"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          /* placeholder delete handler */
                        }}
                        className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-rose-300"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Traction System */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                <p className="text-xs text-zinc-400">Sistema de Tracción</p>
                <div className="mt-3 space-y-2">
                  <Field label="Marca motor" value={selectedEquipment.motorBrand} editable={isEditing && currentRole === 'EMPRESA'} />
                  <Field label="Potencia" value={selectedEquipment.motorPower} editable={isEditing && currentRole === 'EMPRESA'} />
                  <Field label="Alimentación" value={selectedEquipment.voltage} editable={isEditing && currentRole === 'EMPRESA'} />
                  <Field label="Tipo tracción" value={selectedEquipment.tractionType} editable={isEditing && currentRole === 'EMPRESA'} />
                </div>
              </div>

              {/* Cables y performance */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                <p className="text-xs text-zinc-400">Cables y Performance</p>
                <div className="mt-3 space-y-2">
                  <Field label="Cables de tracción" value={selectedEquipment.cableQuantity} editable={isEditing && currentRole === 'EMPRESA'} />
                  <Field label="Sección cable" value={selectedEquipment.cableGauge} editable={isEditing && currentRole === 'EMPRESA'} />
                  <Field label="Paradas" value={selectedEquipment.stopsQuantity} editable={isEditing && currentRole === 'EMPRESA'} />
                  <Field label="Velocidad nominal (m/s)" value={selectedEquipment.nominalSpeed} editable={isEditing && currentRole === 'EMPRESA'} />
                </div>
              </div>

              {/* Cabina y seguridad */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                <p className="text-xs text-zinc-400">Cabina y Seguridad</p>
                <div className="mt-3 space-y-2">
                  <Field label="Peso máximo (kg)" value={selectedEquipment.maxWeight} editable={isEditing && currentRole === 'EMPRESA'} />
                  <Field label="Capacidad" value={selectedEquipment.capacityPeople} editable={isEditing && currentRole === 'EMPRESA'} />
                  <Field label="Control eléctrico" value={selectedEquipment.controlBrand} editable={isEditing && currentRole === 'EMPRESA'} />
                  <Field label="Operador de puertas" value={selectedEquipment.doorOperator} editable={isEditing && currentRole === 'EMPRESA'} />
                </div>
              </div>
            </div>

            {/* Empresa-only global actions */}
            {currentRole === 'EMPRESA' && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button className="rounded-3xl border border-cyan-400 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-white">
                  Registrar Nuevo Equipo
                </button>
                <button className="rounded-3xl border border-emerald-400 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200">
                  Actualizar Información
                </button>
                <button className="rounded-3xl border border-rose-400 bg-rose-500/8 px-4 py-3 text-sm font-semibold text-rose-200">
                  Eliminar Registro
                </button>
              </div>
            )}
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
          <p className="mt-2 text-cyan-300">{sessionRole}</p>
          <p className="mt-3 text-zinc-400">
            {sessionRole === 'CLIENTE'
              ? 'Los clientes pueden visualizar y descargar reportes en modo solo lectura.'
              : 'Las empresas pueden gestionar datos, editar secciones y generar reportes.'}
          </p>
        </div>
      </main>
    </div>
  );
}
