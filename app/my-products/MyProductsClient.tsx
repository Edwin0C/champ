'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClientProductView } from '@/lib/types';
import { claimAction } from '@/lib/actions';
import { formatCountdown } from '@/lib/time';
import FlashMessage from '@/components/FlashMessage';
import { Wallet, Gift, CheckCircle, ShoppingBag, ArrowLeft } from 'lucide-react';

interface MyProductsClientProps {
  productsView: ClientProductView[];
  userBalance: number;
}

export default function MyProductsClient({ productsView, userBalance }: MyProductsClientProps) {
  const router = useRouter();
  const [items, setItems] = useState<ClientProductView[]>(productsView);
  const [flash, setFlash] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);
  const [claimingId, setClaimingId] = useState<number | null>(null);

  // Update timers every second
  useEffect(() => {
    const timer = setInterval(() => {
      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item.canClaim || item.remainingSeconds <= 0) {
            return { ...item, canClaim: true, remainingSeconds: 0 };
          }
          const nextSec = item.remainingSeconds - 1;
          return {
            ...item,
            remainingSeconds: nextSec,
            canClaim: nextSec <= 0,
          };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClaim = async (userProductId: number) => {
    setClaimingId(userProductId);
    const res = await claimAction(userProductId);
    setClaimingId(null);

    if (res?.error) {
      setFlash({ message: res.error, type: 'danger' });
    } else if (res?.success) {
      setFlash({ message: res.success, type: 'success' });
      router.refresh();
    }
  };

  const totalEarnedAll = items.reduce((acc, curr) => acc + curr.totalEarned, 0);

  return (
    <div className="p-4 space-y-4 pb-24">
      <FlashMessage message={flash?.message} type={flash?.type} onClose={() => setFlash(null)} />

      {/* Balance Card */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4 shadow-md">
        <div className="w-12 h-12 bg-liga-yellow rounded-full flex items-center justify-center text-liga-dark shadow-md">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <p className="text-gray-500 text-xs">Saldo disponible</p>
          <p className="text-black text-2xl font-bold">${userBalance.toFixed(2)}</p>
        </div>
      </div>

      {items.length > 0 ? (
        <>
          {/* Summary Card */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-md">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-gray-500 text-xs">Productos activos</p>
                <p className="text-black text-2xl font-bold">{items.length}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Total ganado</p>
                <p className="text-liga-red text-2xl font-bold">${totalEarnedAll.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* List of active investments */}
          {items.map((item) => {
            const progress = Math.min(
              100,
              Math.round((item.up.times_claimed / item.product.days_duration) * 100)
            );
            const isCompleted = item.remainingClaims <= 0;

            return (
              <div
                key={item.up.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
              >
                {/* Product Header */}
                <div className="bg-gradient-to-r from-liga-dark to-liga-blue p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src={item.product.image_url}
                      alt={item.product.title}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-lg object-contain bg-white/10 p-1"
                    />
                    <div>
                      <h3 className="text-white font-bold">{item.product.title}</h3>
                      <p className="text-gray-400 text-xs">
                        Invertidos: ${item.product.price.toFixed(0)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-liga-yellow font-bold text-sm">
                      ${item.product.daily_income.toFixed(2)}/día
                    </p>
                    <p className="text-gray-400 text-xs">
                      {item.up.times_claimed}/{item.product.days_duration} días
                    </p>
                  </div>
                </div>

                {/* Progress & Timer */}
                <div className="p-4 space-y-3">
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Progreso de reclamos</span>
                      <span className="text-liga-dark font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-liga-red to-liga-yellow h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-green-50 rounded-lg p-2">
                      <p className="text-green-600 font-bold">${item.totalEarned.toFixed(2)}</p>
                      <p className="text-gray-400">Ganado</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-2">
                      <p className="text-liga-red font-bold">{item.remainingClaims}</p>
                      <p className="text-gray-400">Días restantes</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2">
                      <p className="text-liga-blue font-bold">
                        ${(item.remainingClaims * item.product.daily_income).toFixed(2)}
                      </p>
                      <p className="text-gray-400">Por ganar</p>
                    </div>
                  </div>

                  {/* Action or Timer */}
                  {isCompleted ? (
                    <div className="bg-gray-100 text-gray-500 text-center py-3 rounded-xl font-medium text-sm flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 mr-1 text-green-500" /> Producto completado
                    </div>
                  ) : item.canClaim ? (
                    <button
                      type="button"
                      disabled={claimingId === item.up.id}
                      onClick={() => handleClaim(item.up.id)}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition transform active:scale-95 text-sm flex items-center justify-center disabled:opacity-50"
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      {claimingId === item.up.id
                        ? 'Reclamando...'
                        : `Reclamar $${item.product.daily_income.toFixed(2)}`}
                    </button>
                  ) : (
                    <div className="bg-liga-dark rounded-xl p-3 text-center">
                      <p className="text-gray-400 text-xs mb-1">Próximo reclamo en</p>
                      <div className="text-liga-yellow font-mono text-2xl font-bold">
                        {formatCountdown(item.remainingSeconds)}
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-liga-yellow h-1.5 rounded-full transition-all"
                          style={{
                            width: `${Math.round(((86400 - item.remainingSeconds) / 86400) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center pt-20 text-center">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-liga-yellow" />
          </div>
          <h3 className="text-white text-lg font-bold mb-2">Sin productos activos</h3>
          <p className="text-gray-400 text-sm mb-6 px-8">
            Invierte en un producto desde la página principal para comenzar a ganar.
          </p>
          <Link
            href="/"
            className="bg-gradient-to-b from-liga-gold to-liga-yellow text-liga-dark font-bold py-3 px-8 rounded-full shadow-lg flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Ver productos
          </Link>
        </div>
      )}
    </div>
  );
}
