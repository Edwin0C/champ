import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getAdminSupabase } from '@/lib/supabase/server';
import { Transaction, User } from '@/lib/types';
import AdminClient from './AdminClient';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    redirect('/login');
  }

  const supabase = getAdminSupabase();

  // Query clients
  const { data: clientsData } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'client')
    .order('created_at', { ascending: false });

  // Query pending recharges
  const { data: pendingRechargesData } = await supabase
    .from('transactions')
    .select('*')
    .eq('type', 'deposit')
    .eq('status', 'pending')
    .order('date', { ascending: false });

  // Query pending investments
  const { data: pendingInvestmentsData } = await supabase
    .from('transactions')
    .select('*')
    .eq('type', 'investment')
    .eq('status', 'pending')
    .order('date', { ascending: false });

  const clients: User[] = clientsData || [];
  const pendingRecharges: Transaction[] = pendingRechargesData || [];
  const pendingInvestments: Transaction[] = pendingInvestmentsData || [];

  return (
    <AdminClient
      adminUser={user}
      clients={clients}
      pendingRecharges={pendingRecharges}
      pendingInvestments={pendingInvestments}
    />
  );
}
