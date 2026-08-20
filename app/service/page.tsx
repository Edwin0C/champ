import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { ChevronLeft, Send } from 'lucide-react';

export default async function ServicePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <div>
      {/* Header */}
      <div className="bg-liga-dark p-4 flex items-center text-white sticky top-0 z-30">
        <Link href="/" className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="flex-grow text-center text-lg font-bold mr-8">Servicio al cliente</h1>
      </div>

      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-liga-blue to-liga-dark -z-10" />

      <div className="p-6 space-y-6 pt-12 flex flex-col items-center">
        {/* Telegram Group Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 w-full max-w-sm text-center text-white shadow-xl">
          <div className="w-16 h-16 bg-liga-yellow rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Send className="w-8 h-8 text-liga-dark" />
          </div>
          <h3 className="font-bold text-lg mb-2">Grupo oficial</h3>
          <p className="text-xs mb-6 opacity-80">
            Horario de atención al cliente: 10:00 a.m. a 8:00 p.m.
          </p>
          <a
            href="https://t.me/innovandosiempre"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-b from-liga-gold to-liga-yellow text-liga-dark font-bold py-2 px-6 rounded-lg shadow hover:from-liga-yellow hover:to-yellow-400 transition inline-block"
          >
            Contáctanos
          </a>
        </div>

        {/* Telegram Channel Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 w-full max-w-sm text-center text-white shadow-xl">
          <div className="w-16 h-16 bg-liga-red rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Send className="w-8 h-8 text-white" />
          </div>
          <p className="text-xs mb-6 opacity-80">Canal de Telegram: 24 horas</p>
          <a
            href="https://t.me/innovandosiempre"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-b from-liga-gold to-liga-yellow text-liga-dark font-bold py-2 px-6 rounded-lg shadow hover:from-liga-yellow hover:to-yellow-400 transition inline-block"
          >
            Únete al canal de Telegram
          </a>
        </div>
      </div>
    </div>
  );
}
