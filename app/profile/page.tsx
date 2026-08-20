import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { logoutAction } from '@/lib/actions';
import {
  ChevronLeft,
  BarChart3,
  FileSpreadsheet,
  History,
  Gift,
  LogOut,
} from 'lucide-react';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <div>
      {/* Header with Balance */}
      <div className="bg-gradient-to-b from-liga-dark to-liga-blue pt-8 pb-16 px-6 rounded-b-[3rem] text-white relative shadow-lg">
        {/* Back Button & Title */}
        <div className="flex items-center mb-6">
          <Link
            href="/"
            className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="ml-4 flex items-center">
            <div className="w-10 h-10 rounded-full bg-liga-yellow flex items-center justify-center border-2 border-liga-gold">
              <Image
                src="/images/logo.png"
                alt="Logo ChampionsVIP"
                width={28}
                height={28}
                className="w-7 h-7 object-contain"
              />
            </div>
            <span className="ml-3 font-bold text-lg">{user.username}</span>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-white rounded-2xl p-6 text-gray-800 shadow-xl mx-auto w-full relative z-10">
          <p className="text-liga-blue text-sm font-medium mb-1">Saldo de la cuenta</p>
          <h2 className="text-3xl font-bold text-liga-dark mb-6">
            USD {Number(user.balance).toFixed(2)}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/recharge"
              className="bg-gradient-to-b from-liga-gold to-liga-yellow hover:from-liga-yellow hover:to-yellow-400 text-liga-dark py-3 rounded-full font-bold text-center shadow-md transition"
            >
              Recargar
            </Link>
            <Link
              href="/withdraw-account"
              className="bg-liga-blue hover:bg-liga-dark text-white py-3 rounded-full font-bold text-center shadow-md transition"
            >
              Retirar
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-liga-blue mt-[-4rem] pt-20 pb-4 px-6 rounded-b-[2rem] text-white flex justify-between text-center text-sm mb-4 shadow-md z-0 relative">
        <div>
          <div className="font-bold opacity-80">Recargar</div>
          <div>USD 0</div>
        </div>
        <div>
          <div className="font-bold opacity-80">Retirar</div>
          <div>USD 0</div>
        </div>
        <div>
          <div className="font-bold opacity-80">Mis productos</div>
          <div>0</div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="px-4 grid grid-cols-2 gap-4 pb-6">
        <Link
          href="/records?type=recharge"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center hover:shadow-md hover:border-liga-yellow transition"
        >
          <BarChart3 className="w-8 h-8 text-liga-blue mb-3" />
          <span className="text-gray-600 text-sm font-medium">Monto detallado</span>
        </Link>

        <Link
          href="/records?type=withdraw"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center hover:shadow-md hover:border-liga-yellow transition"
        >
          <FileSpreadsheet className="w-8 h-8 text-liga-red mb-3" />
          <span className="text-gray-600 text-sm font-medium">Registros de retiros</span>
        </Link>

        <Link
          href="/records?type=recharge"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center hover:shadow-md hover:border-liga-yellow transition"
        >
          <History className="w-8 h-8 text-liga-blue mb-3" />
          <span className="text-gray-600 text-sm font-medium">Registros de recarga</span>
        </Link>

        <Link
          href="/withdraw-account"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center hover:shadow-md hover:border-liga-yellow transition"
        >
          <Gift className="w-8 h-8 text-liga-red mb-3" />
          <span className="text-gray-600 text-sm font-medium">Cuenta de retiro</span>
        </Link>

        <form action={logoutAction} className="col-span-2">
          <button
            type="submit"
            className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-center hover:shadow-md hover:border-red-400 text-gray-600 hover:text-red-600 transition font-medium"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Salir de la cuenta
          </button>
        </form>
      </div>
    </div>
  );
}
