"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/DashboardNavbar';
import FichaTecnicaViewer from '@/components/FichaTecnicaViewer';

const REPORT_MONTHS = [
  { key: 'enero', label: 'Enero' },
  { key: 'febrero', label: 'Febrero' },
  { key: 'marzo', label: 'Marzo' },
  { key: 'abril', label: 'Abril' },
  { key: 'mayo', label: 'Mayo' },
  { key: 'junio', label: 'Junio' },
  { key: 'julio', label: 'Julio' },
  { key: 'agosto', label: 'Agosto' },
  { key: 'septiembre', label: 'Septiembre' },
  { key: 'octubre', label: 'Octubre' },
  { key: 'noviembre', label: 'Noviembre' },
  { key: 'diciembre', label: 'Diciembre' },
];

function formatReportDate(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: '2-digit' });
  } catch {
    return '';
  }
}

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
  const equipmentsWithReports = useMemo(() => {
    return equipments.map((equipment) => {
      const reportFiles = Array.isArray(equipment?.reportFiles) ? equipment.reportFiles : [];
      const reportUrls = Array.isArray(equipment?.reportUrls) ? equipment.reportUrls : [];

      const months = REPORT_MONTHS.map((month, index) => {
        const files = reportFiles.filter((report) => report.month === month.key);
        const legacyUrl = typeof reportUrls[index] === 'string' ? reportUrls[index].trim() : '';

        return { ...month, files, legacyUrl };
      });

      const availableMonths = months.filter((month) => month.files.length > 0 || month.legacyUrl !== '').length;

      return { equipment, months, availableMonths };
    });
  }, [equipments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <DashboardNavbar userName={session?.name} />
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
        <DashboardNavbar userName={session?.name} />

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

                <div className="space-y-6">
                  {equipmentsWithReports.map(({ equipment, months, availableMonths }) => (
                    <div key={equipment.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Reportes</p>
                          <h3 className="mt-2 text-lg font-semibold text-white">
                            {equipment.internalCode || 'Equipo'} · {equipment.type || 'Equipo'}
                          </h3>
                        </div>
                        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                          {availableMonths}/12
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {months.map((month) => {
                          const hasFiles = month.files.length > 0 || month.legacyUrl !== '';

                          return (
                            <div
                              key={`${equipment.id}-${month.key}`}
                              className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-4"
                            >
                              <p className="text-sm font-semibold text-white">{month.label}</p>

                              {hasFiles ? (
                                <ul className="mt-3 space-y-2">
                                  {month.files.map((report) => (
                                    <li key={report.id}>
                                      <a
                                        href={`/api/report/download?id=${encodeURIComponent(report.id)}`}
                                        download={report.fileName || true}
                                        className="block rounded-xl border border-cyan-300/40 bg-cyan-400/90 px-3 py-2 text-[11px] font-semibold text-zinc-950 transition hover:bg-cyan-300"
                                        title={report.fileName}
                                      >
                                        <span className="block truncate">{report.fileName}</span>
                                        <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-800">
                                          {formatReportDate(report.createdAt)}
                                        </span>
                                      </a>
                                    </li>
                                  ))}
                                  {month.files.length === 0 && month.legacyUrl !== '' && (
                                    <li>
                                      <a
                                        href={`/api/report/download?url=${encodeURIComponent(month.legacyUrl)}&fileName=${encodeURIComponent(`reporte-${equipment.internalCode || 'equipo'}-${month.key}.pdf`)}`}
                                        download
                                        className="block rounded-xl border border-cyan-300/40 bg-cyan-400/90 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-cyan-300"
                                      >
                                        Descargar PDF
                                      </a>
                                    </li>
                                  )}
                                </ul>
                              ) : (
                                <div className="mt-4 rounded-xl border border-zinc-700/80 bg-zinc-900/50 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
                                  No disponible
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}