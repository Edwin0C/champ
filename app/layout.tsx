import type { Metadata } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'ChampionsVIP',
  description: 'ChampionsVIP - Plataforma de inversión y tokens oficiales',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-liga-light min-h-screen flex justify-center text-gray-900 antialiased">
        <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col">
          <main className="flex-grow pb-20">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
