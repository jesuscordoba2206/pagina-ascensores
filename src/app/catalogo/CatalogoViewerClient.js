'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, X } from 'lucide-react';

const CATALOGO_PATH = '/itv catalogo.pdf';

export default function CatalogoViewerClient() {
  const router = useRouter();

  const closeViewer = () => {
    router.push('/#inicio');
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_55%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-4 pb-6 pt-6 sm:px-6 lg:px-8">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-900/80 p-3 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeViewer}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-zinc-800/70 px-3 py-2 text-sm font-medium text-white transition hover:border-cyan-400/50 hover:text-cyan-300"
              aria-label="Cerrar visor de catalogo"
            >
              <X className="h-4 w-4" />
              Cerrar
            </button>

            <Link
              href="/#inicio"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Inicio
            </Link>
          </div>

          <Link
            href={CATALOGO_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-black transition hover:opacity-85"
          >
            <Download className="h-4 w-4" />
            Descargar
          </Link>
        </header>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 shadow-2xl shadow-black/25">
          <iframe
            src={`${CATALOGO_PATH}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
            title="Catalogo ITV"
            className="h-[calc(100svh-130px)] w-full rounded-2xl"
          />
        </section>
      </div>
    </div>
  );
}
