import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import RechargeClient from './RechargeClient';
import { ChevronLeft, FileText } from 'lucide-react';

export default async function RechargePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <div>
      {/* Header */}
      <div className="bg-liga-dark p-4 flex items-center text-white sticky top-0 z-30">
        <Link href="/" className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="flex-grow text-center text-lg font-bold mr-8">Recargar</h1>
        <FileText className="w-5 h-5 text-liga-yellow" />
      </div>

      <RechargeClient userBalance={Number(user.balance)} />
    </div>
  );
}
