import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getAdminSupabase } from '@/lib/supabase/server';
import { Transaction, User } from '@/lib/types';
import { formatEcuadorDateTime } from '@/lib/time';
import { ChevronLeft } from 'lucide-react';

interface UserHistoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserHistoryPage({ params }: UserHistoryPageProps) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== 'admin') {
    redirect('/login');
  }

  const { id } = await params;
  const userId = Number(id);

  const supabase = getAdminSupabase();

  const { data: userData } = await supabase.from('users').select('*').eq('id', userId).single();
  if (!userData) {
    redirect('/admin');
  }
  const user = userData as User;

  const { data: txsData } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  const transactions: Transaction[] = txsData || [];

  return (
    <div>
      {/* Header */}
      <div className="bg-liga-dark p-4 flex items-center text-white sticky top-0 z-30">
        <Link href="/admin" className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="flex-grow text-center text-lg font-bold mr-8">Historial de Usuario</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
          <h2 className="font-bold text-liga-dark text-base">
            {user.nombre} {user.apellido}
          </h2>
          <p className="text-gray-500 text-xs font-mono">{user.phone}</p>
          <p className="text-liga-red font-bold text-sm mt-2">
            Saldo Actual: ${Number(user.balance).toFixed(2)} USD
          </p>
        </div>

        {/* Transactions list */}
        <div className="bg-white rounded-xl shadow-md p-2 border border-gray-200">
          {transactions.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {transactions.map((t) => (
                <li key={t.id} className="p-3">
                  <div className="flex justify-between items-start text-xs text-gray-400">
                    <span>{t.type.toUpperCase()}</span>
                    <span>{formatEcuadorDateTime(t.date)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div>
                      <span className="font-bold text-liga-dark text-sm">
                        ${Number(t.amount).toFixed(2)}
                      </span>
                      <p className="text-xs text-gray-500">{t.details}</p>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        t.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : t.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-xs text-center py-6">No hay transacciones registradas</p>
          )}
        </div>
      </div>
    </div>
  );
}
