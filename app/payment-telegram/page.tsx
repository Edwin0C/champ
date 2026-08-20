import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { ChevronLeft, Check, Send, Info, Clock, ArrowLeft } from 'lucide-react';

interface PaymentTelegramPageProps {
  searchParams: Promise<{ amount?: string }>;
}

export default async function PaymentTelegramPage({ searchParams }: PaymentTelegramPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const { amount = '0' } = await searchParams;

  return (
    <div>
      {/* Header */}
      <div className="bg-liga-dark p-4 flex items-center text-white sticky top-0 z-30">
        <Link href="/recharge" className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="flex-grow text-center text-lg font-bold mr-8">Canal de pago</h1>
      </div>

      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-liga-blue via-liga-dark to-[#001230] -z-10" />

      <div className="p-6 pt-12 flex flex-col items-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
          <Check className="w-10 h-10 text-white stroke-[3]" />
        </div>

        <h2 className="text-white text-xl font-bold mb-2">Solicitud registrada</h2>
        <p className="text-gray-400 text-sm text-center mb-8">
          Tu recarga de{' '}
          <span className="text-liga-yellow font-bold text-lg">${amount} USD</span> ha sido
          enviada.
          <br />
          Contacta por Telegram para completar el pago.
        </p>

        {/* Telegram Card */}
        <div className="w-full max-w-sm bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {/* Card Header */}
          <div className="bg-[#0088cc] p-6 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Send className="w-10 h-10 text-[#0088cc]" />
            </div>
            <h3 className="text-white font-bold text-xl">Telegram</h3>
            <p className="text-blue-100 text-sm mt-1">Canal oficial de pagos</p>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-4">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-gray-300 text-xs mb-1">Monto a pagar</p>
              <p className="text-liga-yellow font-extrabold text-3xl">${amount} USD</p>
            </div>

            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-liga-yellow mt-0.5 flex-shrink-0" />
                <p>Envía el comprobante de pago por Telegram para que tu recarga sea aprobada.</p>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-liga-yellow mt-0.5 flex-shrink-0" />
                <p>Tu recarga será procesada en un máximo de 10 minutos.</p>
              </div>
            </div>

            {/* Telegram Button */}
            <a
              href="https://t.me/innovandosiempre"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold py-4 rounded-xl text-center text-lg shadow-lg shadow-[#0088cc]/30 transition transform active:scale-95 mt-4"
            >
              Ir a Telegram
            </a>
          </div>
        </div>

        {/* Back to Dashboard */}
        <Link
          href="/"
          className="mt-6 text-gray-400 hover:text-liga-yellow text-sm transition flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>
      </div>
    </div>
  );
}
