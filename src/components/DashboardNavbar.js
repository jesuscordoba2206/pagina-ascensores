'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardNavbar({ onLogout }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Server-side route clears cookie
      await fetch('/api/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    // client-side cleanup
    try {
      localStorage.removeItem('userEmail');
    } catch (e) {}
    router.push('/login');
    if (onLogout) onLogout();
  };

  return (
    <div className="w-full flex justify-between items-center py-4 px-6 bg-zinc-900/30 backdrop-blur-md border-b border-zinc-800/80 mb-8 rounded-xl">
      <div className="flex items-center gap-3">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-200 hover:text-white transition-all duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 11l9-7 9 7v8a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-5H9v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2z" />
          </svg>
          <span className="hidden sm:inline">Ver Web Principal</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:text-red-400 hover:border-red-400/40 transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8v8" />
          </svg>
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
