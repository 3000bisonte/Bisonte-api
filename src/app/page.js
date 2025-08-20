'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Siempre redirigir a /login al abrir la app
    router.replace('/login');
  }, [router]);

  // Mostrar loading mientras se verifica
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Verificando sesión...</h2>
        <p className="text-gray-600">Un momento por favor</p>
      </div>
    </div>
  );
}
