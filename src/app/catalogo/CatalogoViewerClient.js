'use client';

import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

const CATALOGO_VIEW_ENDPOINT = '/api/catalogo/view';

export default function CatalogoViewerClient({ accessToken }) {
  const router = useRouter();

  const closeViewer = () => {
    router.push('/#inicio');
  };

  const viewerSrc = `${CATALOGO_VIEW_ENDPOINT}?token=${encodeURIComponent(accessToken)}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`;

  return (
    <div className="relative -mt-24 min-h-screen bg-zinc-950 text-white md:-mt-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_55%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-4 pb-6 pt-6 sm:px-6 lg:px-8">
        <header className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/80 p-3 backdrop-blur-md">
          <button
            type="button"
            onClick={closeViewer}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-zinc-800/70 px-3 py-2 text-sm font-medium text-white transition hover:border-cyan-400/50 hover:text-cyan-300"
            aria-label="Cerrar visor de catalogo"
          >
            <X className="h-4 w-4" />
            Cerrar
          </button>
        </header>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 shadow-2xl shadow-black/25">
          <iframe
            src={viewerSrc}
            title="Catalogo ITV"
            className="h-[calc(100svh-130px)] w-full rounded-2xl"
            sandbox="allow-same-origin allow-scripts"
          />
        </section>
      </div>
    </div>
  );
}
