import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getAdminSupabase } from '@/lib/supabase/server';
import { Transaction } from '@/lib/types';
import { formatEcuadorDateTime } from '@/lib/time';
import { ChevronLeft } from 'lucide-react';

interface RecordsPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function RecordsPage({ searchParams }: RecordsPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const { type = 'recharge' } = await searchParams;
  const isRecharge = type === 'recharge';
  const title = isRecharge ? 'recarga' : 'retiros';
  const filterType = isRecharge ? 'deposit' : 'withdraw';

  const supabase = getAdminSupabase();
  const { data: txsData } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .ilike('type', `%${filterType}%`)
    .order('date', { ascending: false });

  const transactions: Transaction[] = txsData || [];

  return (
    <div>
      {/* Header */}
      <div className="bg-liga-dark p-4 flex items-center text-white sticky top-0 z-30">
        <Link href="/profile" className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="flex-grow text-center text-lg font-bold mr-8">Registros de {title}</h1>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-lg shadow-md min-h-[60vh] p-2">
          {transactions.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {transactions.map((t) => (
                <li key={t.id} className="p-4">
                  <div className="flex justify-between items-start mb-1 text-xs text-gray-400">
                    <span>
                      {t.id}000{t.user_id}
                    </span>
                    <span>{formatEcuadorDateTime(t.date)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-liga-dark font-bold text-lg">
                      USD {Number(t.amount).toFixed(0)}
                    </span>
                    <span
                      className={`font-bold text-sm ${
                        t.status === 'approved'
                          ? 'text-green-500'
                          : t.status === 'rejected'
                          ? 'text-liga-red'
                          : 'text-liga-blue'
                      }`}
                    >
                      {t.status === 'approved'
                        ? 'Exitosa'
                        : t.status === 'rejected'
                        ? 'Rechazada'
                        : 'Pendiente'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <p>No hay más datos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
