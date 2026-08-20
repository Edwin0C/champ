'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { rechargeRequestAction } from '@/lib/actions';
import FlashMessage from '@/components/FlashMessage';
import { Coins, Send, ArrowUpDown } from 'lucide-react';

interface RechargeClientProps {
  userBalance: number;
}

const AMOUNTS = [7, 18, 40, 100, 200, 400, 800, 1500, 1980];

export default function RechargeClient({ userBalance }: RechargeClientProps) {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(18);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 7) {
      setError('El importe mínimo de recarga es $7 USD.');
      return;
    }
    setLoading(true);
    const res = await rechargeRequestAction(amount);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      router.push(`/payment-telegram?amount=${amount}`);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <FlashMessage message={error} type="danger" onClose={() => setError(null)} />

      {/* Balance Card */}
      <div className="bg-white rounded-2xl p-6 shadow-md flex items-center border border-gray-200">
        <div className="w-12 h-12 bg-liga-yellow rounded-full flex items-center justify-center text-liga-dark mr-4">
          <Coins className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-liga-dark">USD {userBalance.toFixed(2)}</h2>
          <p className="text-gray-500 text-sm">Saldo actual</p>
        </div>
      </div>

      {/* Amount Selection */}
      <div>
        <label className="block text-gray-700 font-bold mb-2">Monto</label>
        <div className="bg-yellow-50 border-2 border-liga-yellow rounded-lg p-3 flex justify-between items-center mb-4">
          <span className="text-liga-dark font-bold text-lg">{amount}</span>
          <ArrowUpDown className="w-5 h-5 text-liga-blue" />
        </div>

        <p className="text-liga-blue font-bold text-sm mb-3">Selecciona un valor rápido</p>
        <div className="grid grid-cols-3 gap-3">
          {AMOUNTS.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setAmount(val)}
              className={`py-3 rounded-lg font-medium transition shadow-sm border-2 ${
                amount === val
                  ? 'bg-liga-yellow text-liga-dark border-liga-yellow font-bold'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-yellow-50 hover:border-liga-yellow'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Recharge Form */}
      <form onSubmit={handleSubmit}>
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-b from-liga-gold to-liga-yellow text-liga-dark font-bold py-4 rounded-lg shadow-md hover:shadow-lg transition text-lg flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-5 h-5 mr-2" />
            {loading ? 'Procesando...' : 'Canal de pago'}
          </button>
        </div>
      </form>

      {/* Instructions */}
      <div className="bg-yellow-50 rounded-xl p-4 text-sm text-gray-600 space-y-2 border border-yellow-300">
        <p className="font-bold text-liga-dark">Recordatorio de recarga:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Importe mínimo de recarga: $7 USD.</li>
          <li>El importe del pedido debe coincidir con el pago.</li>
          <li>El servicio de recarga está disponible las 24 horas.</li>
          <li>Si sus fondos no llegan en 10 minutos, contacte soporte.</li>
        </ol>
      </div>
    </div>
  );
}
