import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getAdminSupabase } from '@/lib/supabase/server';
import { ClientProductView, Product, UserProduct } from '@/lib/types';
import { calculateRemainingSeconds } from '@/lib/time';
import MyProductsClient from './MyProductsClient';
import { ChevronLeft } from 'lucide-react';

export default async function MyProductsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const supabase = getAdminSupabase();
  const { data: userProductsData } = await supabase
    .from('user_products')
    .select('*, product:products(*)')
    .eq('user_id', user.id)
    .order('purchased_at', { ascending: false });

  const productsView: ClientProductView[] = (userProductsData || []).map((item) => {
    const product = item.product as Product;
    const up = item as UserProduct;

    const baseTime = up.last_claimed_at || up.purchased_at;
    const { canClaim, remainingSeconds } = calculateRemainingSeconds(baseTime);
    const remainingClaims = Math.max(0, product.days_duration - up.times_claimed);
    const totalEarned = up.times_claimed * Number(product.daily_income);

    return {
      up,
      product: {
        ...product,
        price: Number(product.price),
        daily_income: Number(product.daily_income),
        total_income: Number(product.total_income),
      },
      canClaim,
      remainingSeconds,
      remainingClaims,
      totalEarned,
    };
  });

  return (
    <div>
      {/* Header */}
      <div className="bg-liga-dark p-4 flex items-center text-white sticky top-0 z-30 shadow-md">
        <Link href="/" className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="flex-grow text-center text-lg font-bold mr-8">Mis productos</h1>
      </div>

      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-liga-blue to-[#001230] -z-10" />

      <MyProductsClient productsView={productsView} userBalance={Number(user.balance)} />
    </div>
  );
}
