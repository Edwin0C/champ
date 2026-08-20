import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getAdminSupabase } from '@/lib/supabase/server';
import { Product } from '@/lib/types';
import DashboardClient from './DashboardClient';
import { CalendarCheck, Wallet, HandCoins } from 'lucide-react';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role === 'admin') {
    redirect('/admin');
  }

  const supabase = getAdminSupabase();
  const { data: productsData } = await supabase
    .from('products')
    .select('*')
    .order('price', { ascending: true });

  const products: Product[] = (productsData || []).map((p) => ({
    ...p,
    price: Number(p.price),
    daily_income: Number(p.daily_income),
    total_income: Number(p.total_income),
  }));

  return (
    <div>
      {/* Top Banner Area */}
      <div className="bg-gradient-to-b from-liga-dark to-liga-blue pb-16 pt-8 px-4 rounded-b-3xl">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
          <div className="h-32 bg-white/10 rounded-xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-liga-blue via-liga-dark to-liga-red opacity-80" />
            <div className="relative z-10 flex flex-col items-center">
              <Image
                src="/images/logo.png"
                alt="Logo ChampionsVIP"
                width={64}
                height={64}
                className="w-16 h-16 object-contain drop-shadow-lg mb-1"
                priority
              />
              <h2 className="text-liga-yellow font-extrabold text-2xl drop-shadow-md">
                Champions<span className="text-white">VIP</span>
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 -mt-8 relative z-10 grid grid-cols-3 gap-2 mb-6">
        <Link href="/my-products" className="flex flex-col items-center group">
          <div className="w-12 h-12 bg-liga-yellow rounded-full flex items-center justify-center text-liga-dark shadow-md mb-1 group-hover:scale-105 transition-transform">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <span className="text-xs text-gray-700 font-medium">Reclamar</span>
        </Link>

        <Link href="/recharge" className="flex flex-col items-center group">
          <div className="w-12 h-12 bg-liga-red rounded-full flex items-center justify-center text-white shadow-md mb-1 group-hover:scale-105 transition-transform">
            <Wallet className="w-6 h-6" />
          </div>
          <span className="text-xs text-gray-700 font-medium">Recargar</span>
        </Link>

        <Link href="/withdraw-account" className="flex flex-col items-center group">
          <div className="w-12 h-12 bg-liga-blue rounded-full flex items-center justify-center text-liga-yellow shadow-md mb-1 group-hover:scale-105 transition-transform">
            <HandCoins className="w-6 h-6" />
          </div>
          <span className="text-xs text-gray-700 font-medium">Retirar</span>
        </Link>
      </div>

      {/* Interactive Products & Modals */}
      <DashboardClient products={products} userBalance={Number(user.balance)} />
    </div>
  );
}
