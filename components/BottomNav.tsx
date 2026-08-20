'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  // Ocultar en login, register y admin
  if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/admin')) {
    return null;
  }

  const isHome = pathname === '/';
  const isProducts = pathname === '/my-products';
  const isProfile = pathname === '/profile';

  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-liga-dark border-t border-liga-blue z-40">
      <div className="grid grid-cols-3 h-16">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center transition-colors ${
            isHome ? 'text-liga-yellow' : 'text-gray-400 hover:text-liga-yellow'
          }`}
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-xs">Inicio</span>
        </Link>

        <Link
          href="/my-products"
          className={`flex flex-col items-center justify-center transition-colors ${
            isProducts ? 'text-liga-yellow' : 'text-gray-400 hover:text-liga-yellow'
          }`}
        >
          <ShoppingBag className="w-5 h-5 mb-1" />
          <span className="text-xs">Mis productos</span>
        </Link>

        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center transition-colors ${
            isProfile ? 'text-liga-yellow' : 'text-gray-400 hover:text-liga-yellow'
          }`}
        >
          <User className="w-5 h-5 mb-1" />
          <span className="text-xs">Mi cuenta</span>
        </Link>
      </div>
    </nav>
  );
}
