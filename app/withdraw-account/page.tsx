import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import WithdrawClient from './WithdrawClient';
import { ChevronLeft } from 'lucide-react';

interface WithdrawAccountPageProps {
  searchParams: Promise<{ edit?: string }>;
}

export default async function WithdrawAccountPage({ searchParams }: WithdrawAccountPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const { edit } = await searchParams;
  const isEditing = Boolean(edit);

  return (
    <div>
      {/* Header */}
      <div className="bg-liga-dark p-4 flex items-center text-white sticky top-0 z-30">
        <Link href="/profile" className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="flex-grow text-center text-lg font-bold mr-8">Cuenta de retiro</h1>
      </div>

      <WithdrawClient user={user} isEditing={isEditing} />
    </div>
  );
}
