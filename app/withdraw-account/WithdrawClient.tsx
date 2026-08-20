'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';
import { saveWithdrawAccountAction } from '@/lib/actions';
import FlashMessage from '@/components/FlashMessage';
import { Coins, Landmark, CheckCircle, User as UserIcon, CreditCard, Send, Edit, ChevronDown } from 'lucide-react';

interface WithdrawClientProps {
  user: User;
  isEditing: boolean;
}

const BANKS = ['Banco Pichincha', 'Banco del Pacífico', 'Banco Guayaquil', 'Produbanco'];

export default function WithdrawClient({ user, isEditing: initialEditing }: WithdrawClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  const hasAccount = Boolean(user.withdraw_account_name);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await saveWithdrawAccountAction(formData);
    setLoading(false);

    if (res?.error) {
      setFlash({ message: res.error, type: 'danger' });
    } else {
      setFlash({ message: 'Cuenta de retiro guardada correctamente.', type: 'success' });
      setIsEditing(false);
      router.refresh();
    }
  };

  return (
    <div className="p-4 space-y-6">
      <FlashMessage message={flash?.message} type={flash?.type} onClose={() => setFlash(null)} />

      {/* Balance Header */}
      <div className="bg-white rounded-2xl p-6 shadow-md flex items-center border border-gray-200">
        <div className="w-12 h-12 bg-liga-yellow rounded-full flex items-center justify-center text-liga-dark mr-4">
          <Coins className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-liga-dark">USD {Number(user.balance).toFixed(0)}</h2>
          <p className="text-gray-500 text-sm">Saldo de la cuenta</p>
        </div>
      </div>

      {hasAccount && !isEditing ? (
        /* Saved Account View */
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-liga-dark to-liga-blue p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-liga-yellow" />
              <span className="text-white font-bold">Cuenta guardada</span>
            </div>
            <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full flex items-center">
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Verificada
            </span>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <p className="text-gray-400 text-xs">Nombre de la cuenta</p>
                <p className="text-liga-dark font-bold text-sm">{user.withdraw_account_name}</p>
              </div>
              <UserIcon className="w-5 h-5 text-liga-blue/50" />
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <p className="text-gray-400 text-xs">Banco</p>
                <p className="text-liga-dark font-bold text-sm">{user.withdraw_bank_name}</p>
              </div>
              <Landmark className="w-5 h-5 text-liga-blue/50" />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-xs">Número de cuenta</p>
                <p className="text-liga-dark font-bold text-sm tracking-wider">
                  {user.withdraw_account_number}
                </p>
              </div>
              <CreditCard className="w-5 h-5 text-liga-blue/50" />
            </div>
          </div>

          <div className="px-5 pb-5 space-y-3">
            <a
              href="https://t.me/innovandosiempre"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center"
            >
              <Send className="w-4 h-4 mr-2" /> Retirar
            </a>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-full text-center bg-gradient-to-b from-liga-gold to-liga-yellow text-liga-dark font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center"
            >
              <Edit className="w-4 h-4 mr-2" /> Editar cuenta
            </button>
          </div>
        </div>
      ) : (
        /* Form View */
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-liga-dark font-bold mb-1 ml-1 text-sm">Nombre de la cuenta</p>
            <input
              type="text"
              name="account_name"
              placeholder="Introduce tu nombre"
              defaultValue={user.withdraw_account_name || ''}
              required
              className="w-full bg-white border-2 border-gray-300 rounded-lg p-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-liga-yellow transition"
            />
          </div>

          <div>
            <p className="text-liga-dark font-bold mb-1 ml-1 text-sm">Nombre del banco</p>
            <div className="relative">
              <select
                name="bank_name"
                defaultValue={user.withdraw_bank_name || BANKS[0]}
                required
                className="w-full bg-white border-2 border-gray-300 rounded-lg p-4 text-gray-900 appearance-none focus:outline-none focus:border-liga-yellow transition"
              >
                {BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-liga-blue">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <p className="text-liga-dark font-bold mb-1 ml-1 text-sm">Introduce la cuenta para retiro:</p>
            <input
              type="text"
              name="account_number"
              placeholder="Por favor, introduce tu número de cuenta."
              defaultValue={user.withdraw_account_number || ''}
              required
              className="w-full bg-white border-2 border-gray-300 rounded-lg p-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-liga-yellow transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-b from-liga-gold to-liga-yellow text-liga-dark font-bold py-4 rounded-lg shadow-lg hover:from-liga-yellow hover:to-yellow-400 transition mt-6 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>

          {hasAccount && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="block w-full text-center text-gray-500 hover:text-gray-700 font-medium py-2 transition"
            >
              Cancelar
            </button>
          )}
        </form>
      )}
    </div>
  );
}
