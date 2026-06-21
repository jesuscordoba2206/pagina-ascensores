"use client";

import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();

    setLoading(true);
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
      .then((r) => r.json())
      .then((data) => {
        setLoading(false);
        if (data?.ok) {
          router.push('/dashboard');
        } else {
          alert(data?.error || 'Login failed');
        }
      })
      .catch(() => {
        setLoading(false);
        alert('Login failed');
      });
  };

  return (
    <div className="bg-zinc-950 text-white min-h-screen">
      <Navbar />

      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-20">
        <div className="w-full max-w-md bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-[2.5rem] p-10">
          <h1 className="text-4xl font-bold text-white mb-4">Acceder al Portal de Gestión</h1>
          <p className="text-zinc-400 font-light mb-8 leading-relaxed">
            Ingresa tus credenciales para revisar historiales, reportes y estados en tiempo real.
          </p>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <label className="block text-sm uppercase tracking-[0.18em] text-zinc-400">
              ID de Cliente
              <input
                name="email"
                type="text"
                className="mt-3 w-full rounded-[2rem] border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                placeholder="Ingresa tu ID"
              />
            </label>

            <label className="block text-sm uppercase tracking-[0.18em] text-zinc-400">
              Contraseña
              <input
                name="password"
                type="password"
                className="mt-3 w-full rounded-[2rem] border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                placeholder="********"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[2.5rem] bg-cyan-400 text-black py-4 font-bold uppercase tracking-wide transition-all duration-300 hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Conectando...' : 'Acceder al Portal de Gestión'}
            </button>
          </form>

          {/* Este formulario conectará con la base de datos de gestión de ascensores: historiales, reportes y estados en tiempo real. */}
        </div>
      </main>

      <footer className="bg-black border-t border-gray-800 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-sm tracking-wide">© 2026 J_web. Ingeniería en Transporte Vertical.</p>
        </div>
      </footer>
    </div>
  );
}
