'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { registerAction } from '@/lib/actions';
import FlashMessage from '@/components/FlashMessage';
import { User, Phone, Lock } from 'lucide-react';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await registerAction(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-10 px-6">
      <FlashMessage message={error} type="danger" onClose={() => setError(null)} />

      {/* Logo */}
      <div className="w-full flex justify-center mb-8">
        <div className="text-center">
          <Image
            src="/images/logo.png"
            alt="Logo ChampionsVIP"
            width={80}
            height={80}
            className="w-20 h-20 object-contain mx-auto mb-3 drop-shadow-lg"
            priority
          />
          <h1 className="text-3xl font-extrabold text-liga-dark">
            Champions<span className="text-liga-red">VIP</span>
          </h1>
          <p className="text-gray-500 mt-2">Crear cuenta</p>
        </div>
      </div>

      {/* Register Form Container */}
      <div className="w-full bg-white rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre Input */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Nombre</label>
            <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden focus-within:border-liga-yellow transition">
              <div className="px-4 py-3 bg-gray-50 border-r border-gray-300 text-gray-600">
                <User className="w-4 h-4 text-liga-blue" />
              </div>
              <input
                type="text"
                name="nombre"
                placeholder="Ingresa tu nombre"
                required
                className="w-full py-3 px-4 bg-white outline-none text-gray-700"
              />
            </div>
          </div>

          {/* Apellido Input */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Apellido</label>
            <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden focus-within:border-liga-yellow transition">
              <div className="px-4 py-3 bg-gray-50 border-r border-gray-300 text-gray-600">
                <User className="w-4 h-4 text-liga-blue" />
              </div>
              <input
                type="text"
                name="apellido"
                placeholder="Ingresa tu apellido"
                required
                className="w-full py-3 px-4 bg-white outline-none text-gray-700"
              />
            </div>
          </div>

          {/* Phone Input */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Número de teléfono</label>
            <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden focus-within:border-liga-yellow transition">
              <div className="px-4 py-3 bg-gray-50 border-r border-gray-300 text-gray-600 flex items-center font-medium">
                <Phone className="w-4 h-4 mr-2 text-liga-blue" /> +593
              </div>
              <input
                type="tel"
                name="phone"
                placeholder="987654321"
                pattern="9[0-9]{8}"
                maxLength={9}
                required
                className="w-full py-3 px-4 bg-white outline-none text-gray-700"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Debe comenzar con 9 (sin el 0 inicial)</p>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
            <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden focus-within:border-liga-yellow transition">
              <div className="px-4 py-3 bg-gray-50 border-r border-gray-300 text-gray-600">
                <Lock className="w-4 h-4 text-liga-blue" />
              </div>
              <input
                type="password"
                name="password"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
                className="w-full py-3 px-4 bg-white outline-none text-gray-700"
              />
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-b from-liga-gold to-liga-yellow hover:from-liga-yellow hover:to-yellow-400 text-liga-dark font-bold py-4 rounded-full shadow-lg transition duration-300 text-lg disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>

          {/* Login Link */}
          <Link
            href="/login"
            className="block w-full bg-liga-blue hover:bg-liga-dark text-white font-bold py-4 rounded-full transition duration-300 text-lg text-center"
          >
            Ya tengo cuenta
          </Link>
        </form>
      </div>
    </div>
  );
}
