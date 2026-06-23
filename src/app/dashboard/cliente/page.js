"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/DashboardNavbar';
import FichaTecnicaViewer from '@/components/FichaTecnicaViewer';

function Card({ label, value, unit }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-lg font-semibold text-white">{String(value ?? '-')}</span>
        {unit ? <span className="text-sm text-zinc-500">{unit}</span> : null}
      </div>
    </div>
  );
}

export default function ClientDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [currentFichaTecnica, setCurrentFichaTecnica] = useState(null);

  useEffect(() => {
    let alive = true;

    async function loadData() {
      try {
        const sessionResponse = await fetch('/api/session');
        const sessionData = await sessionResponse.json();

        if (!alive) return;

        if (sessionData?.role !== 'CLIENTE') {
          router.replace('/login');
          return;
        }

        setSession(sessionData);

        const equipmentResponse = await fetch('/api/equipment');
        const equipmentData = await equipmentResponse.json();

        if (!alive) return;

        setEquipments(Array.isArray(equipmentData) ? equipmentData : []);

        // Load ficha técnica for the first equipment
        if (Array.isArray(equipmentData) && equipmentData.length > 0) {
          try {
            const fichaResponse = await fetch(`/api/ficha-tecnica?equipmentId=${equipmentData[0].id}`);
            if (fichaResponse.ok) {
              const fichaData = await fichaResponse.json();
              if (alive) setCurrentFichaTecnica(fichaData);
            }
          } catch (err) {
            console.error('Error loading ficha técnica:', err);
          }
        }
      } catch (error) {
        router.replace('/login');
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadData();

    return () => {
      alive = false;
    };
  }, [router]);

  const activeEquipment = useMemo(() => equipments[0] || null, [equipments]);
  const activeReportUrls = useMemo(() => {
    if (!activeEquipment?.reportUrls || !Array.isArray(activeEquipment.reportUrls)) return [];
    return activeEquipment.reportUrls.filter((url) => typeof url === 'string' && url.trim() !== '');
  }, [activeEquipment]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <DashboardNavbar />
          <div className="mt-8 rounded-[2rem] border border-zinc-800 bg-zinc-900/70 p-8 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Cargando</p>
            <h1 className="mt-6 text-3xl font-semibold">Cargando tus equipos...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_36%),linear-gradient(180deg,#09090b_0%,#000_100%)] text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <DashboardNavbar />

        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-400">Dashboard Cliente</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight md:text-6xl">
              Tus equipos reales en Atlas
            </h1>
            <p className="mt-4 max-w-3xl text-base text-zinc-300 md:text-lg">
              Esta vista carga únicamente los ascensores asociados a tu sesión actual.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Sesión</p>
            <p className="mt-2 text-lg font-semibold text-white">{session?.email || 'cliente'}</p>
            <p className="mt-1 text-sm text-cyan-300">{session?.id || 'sin id'}</p>
          </div>
        </div>

        <main className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md">
            <p className="text-xs uppercase tracking-widest text-zinc-500">Equipos vinculados</p>
            <div className="mt-4 space-y-3">
              {equipments.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm text-zinc-400">
                  No hay equipos registrados para este cliente.
                </div>
              ) : (
                equipments.map((equipment) => (
                  <div key={equipment.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                    <p className="font-semibold text-white">{equipment.internalCode || 'Sin código'}</p>
                    <p className="mt-1 text-sm text-zinc-400">{equipment.type || 'Equipo'}</p>
                  </div>
                ))
              )}
            </div>
          </aside>

          <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-6 shadow-xl shadow-cyan-500/10 backdrop-blur-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-400">Ficha técnica completa</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Especificaciones técnicas</h2>
              </div>
            </div>

            {!activeEquipment ? (
              <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 text-zinc-400">
                Cuando este cliente tenga equipos asociados en Atlas, aparecerán aquí.
              </div>
            ) : (
              <div className="mt-8 space-y-8">
                <FichaTecnicaViewer fichaTecnica={currentFichaTecnica} />

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Reportes</p>
                      <h3 className="mt-2 text-lg font-semibold text-white">PDF disponibles</h3>
                    </div>
                    <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                      {activeReportUrls.length}
                    </span>
                  </div>

                  {activeReportUrls.length === 0 ? (
                    <p className="mt-4 text-sm text-zinc-400">
                      Aun no tienes reportes PDF cargados para este equipo.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {activeReportUrls.map((url, index) => (
                        <div
                          key={`${url}-${index}`}
                          className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <p className="text-sm text-zinc-200">Reporte PDF #{index + 1}</p>
                          <div className="flex gap-2">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-2xl border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:border-zinc-500"
                            >
                              Visualizar
                            </a>
                            <a
                              href={url}
                              download
                              className="rounded-2xl bg-cyan-500 px-3 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-cyan-400"
                            >
                              Descargar
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}