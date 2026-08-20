'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { investAction } from '@/lib/actions';
import FlashMessage from '@/components/FlashMessage';
import { X, Rocket } from 'lucide-react';

interface DashboardClientProps {
  products: Product[];
  userBalance: number;
}

export default function DashboardClient({ products, userBalance }: DashboardClientProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  useEffect(() => {
    const welcomeShown = sessionStorage.getItem('welcomeShown');
    if (!welcomeShown) {
      setShowWelcome(true);
      sessionStorage.setItem('welcomeShown', 'true');
    }
  }, []);

  const handleInvest = async () => {
    if (!selectedProduct) return;
    setLoading(true);
    const res = await investAction(selectedProduct.id);
    setLoading(false);
    setSelectedProduct(null);

    if (res?.error) {
      setFlash({ message: res.error, type: 'danger' });
    } else if (res?.success) {
      setFlash({ message: res.success, type: 'success' });
    }
  };

  return (
    <>
      <FlashMessage message={flash?.message} type={flash?.type} onClose={() => setFlash(null)} />

      {/* Product List */}
      <div className="px-4 pb-4 space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-md p-4 flex flex-col relative overflow-hidden border border-gray-200"
          >
            {/* Duration Badge */}
            <span className="absolute top-0 right-0 bg-liga-red text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
              Días: {product.days_duration} Días
            </span>

            <div className="flex">
              {/* Product Image */}
              <div className="w-1/3 flex items-center justify-center">
                <Image
                  src={product.image_url}
                  alt={product.title}
                  width={96}
                  height={96}
                  className="w-24 h-24 object-contain"
                />
              </div>

              {/* Details */}
              <div className="w-2/3 pl-4 pt-4">
                <h3 className="font-bold text-liga-dark text-lg mb-1">{product.title}</h3>

                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div>
                    <p className="text-liga-red font-bold text-sm">USD {product.daily_income.toFixed(0)}</p>
                    <p className="text-gray-400">Días (Ingreso)</p>
                  </div>
                  <div>
                    <p className="text-liga-red font-bold text-sm">USD {product.total_income.toFixed(0)}</p>
                    <p className="text-gray-400">Ingresos totales</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
              <div>
                <span className="text-gray-400 text-xs">Precio</span>
                <span className="text-liga-dark font-bold text-lg ml-1">
                  USD {product.price.toFixed(0)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProduct(product)}
                className="bg-gradient-to-b from-liga-gold to-liga-yellow hover:from-liga-yellow hover:to-yellow-400 text-liga-dark font-bold py-2 px-6 rounded-full text-sm shadow-md transition transform active:scale-95"
              >
                Invertir ahora
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Investment Confirmation Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-liga-blue p-4 text-white text-center relative">
              <h3 className="text-lg font-bold">Confirmar Inversión</h3>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="absolute right-4 top-4 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center mb-4">
                <p className="text-gray-500 text-sm">Producto</p>
                <h4 className="text-xl font-bold text-liga-dark">{selectedProduct.title}</h4>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 space-y-2 border border-yellow-300">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Precio:</span>
                  <span className="font-bold text-liga-dark">${selectedProduct.price.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Ingreso Diario:</span>
                  <span className="font-bold text-liga-red">${selectedProduct.daily_income.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Ingreso Total:</span>
                  <span className="font-bold text-liga-red">${selectedProduct.total_income.toFixed(0)}</span>
                </div>
              </div>

              <p className="text-xs text-center text-gray-500 mt-2">
                Se descontará el precio de tu saldo. Podrás reclamar ganancias cada 24 horas.
              </p>
            </div>

            <div className="p-4 bg-gray-50 flex justify-center space-x-3">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="px-6 py-2 rounded-full border border-gray-300 text-gray-600 font-medium hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleInvest}
                className="px-6 py-2 rounded-full bg-gradient-to-b from-liga-gold to-liga-yellow text-liga-dark font-bold shadow-lg hover:shadow-xl transition transform active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-0 overflow-hidden shadow-2xl relative">
            {/* Header */}
            <div className="bg-liga-dark p-4 border-b flex justify-between items-center relative">
              <h3 className="text-lg font-bold text-center w-full text-white">
                Bienvenido a ChampionsVIP
              </h3>
              <button
                type="button"
                onClick={() => setShowWelcome(false)}
                className="absolute right-4 text-liga-yellow font-bold hover:bg-white/10 rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 text-sm text-gray-700 space-y-2 max-h-[60vh] overflow-y-auto">
              <p>Bono de Registro: $3</p>
              <p>Registro Diario: $0.1</p>
              <p>Reembolso por Inversión de hasta un 33%: Nivel 1 30%, Nivel 2 2%, Nivel 3 1%</p>
              <p>Invierte $7 y gana $1 al día.</p>
              <p>Invierte $18 y gana $3 al día.</p>
              <p className="mt-4">Únete a nuestro grupo de Telegram para obtener los últimos códigos.</p>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 flex justify-center">
              <a
                href="https://t.me/innovandosiempre"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-b from-liga-gold to-liga-yellow text-liga-dark font-bold py-3 px-8 rounded-full shadow-lg flex items-center hover:opacity-90 transition"
              >
                <Rocket className="w-4 h-4 mr-2" /> Unirse al grupo de Telegram
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
