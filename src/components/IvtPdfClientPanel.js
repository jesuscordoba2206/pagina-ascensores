"use client";

import { useState } from 'react';
import { Download, FileText } from 'lucide-react';

function formatBytes(value) {
  if (!Number.isFinite(value) || value <= 0) return 'Sin dato';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function IvtPdfClientPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  async function loadFiles() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/itv-pdf');
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || `Error HTTP ${response.status}`);
      }

      setFiles(Array.isArray(payload?.files) ? payload.files : []);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los archivos ITV.');
    } finally {
      setLoading(false);
    }
  }

  function handleTogglePanel() {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        void loadFiles();
      }
      return next;
    });
  }

  return (
    <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-6 shadow-xl shadow-cyan-500/10 backdrop-blur-md">
      <button
        type="button"
        onClick={handleTogglePanel}
        className="flex w-full items-center justify-between rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-left text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
      >
        <span className="inline-flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Archivos PDF ITV
        </span>
        <span className="text-xs uppercase tracking-[0.18em] text-cyan-300">{isOpen ? 'Ocultar' : 'Abrir'}</span>
      </button>

      {isOpen && (
        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
          {loading ? (
            <p className="rounded-2xl border border-dashed border-zinc-800 px-4 py-6 text-center text-xs text-zinc-500">Cargando archivos...</p>
          ) : error ? (
            <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">{error}</p>
          ) : files.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-800 px-4 py-6 text-center text-xs text-zinc-500">No hay archivos PDF ITV disponibles para tu usuario.</p>
          ) : (
            <ul className="space-y-2">
              {files.map((file) => (
                <li key={file.id}>
                  <a
                    href={`/api/itv-pdf/download?id=${encodeURIComponent(file.id)}`}
                    download
                    className="flex items-center gap-3 rounded-2xl border border-zinc-800/70 bg-zinc-950/60 px-3 py-2 transition hover:border-cyan-500/50 hover:text-cyan-300"
                    title={file.fileName}
                  >
                    <FileText className="h-4 w-4 shrink-0 text-zinc-500" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-zinc-100">{file.fileName}</span>
                      <span className="mt-0.5 block text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                        {formatDate(file.createdAt)} · {formatBytes(file.size)}
                      </span>
                    </span>
                    <Download className="h-4 w-4 shrink-0 text-zinc-500" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
