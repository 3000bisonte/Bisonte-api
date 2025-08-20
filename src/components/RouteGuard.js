"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthSession } from '@/hooks/useAuthSession';
import { Capacitor } from '@capacitor/core';

/**
 * Componente de protección de rutas
 */
export function RouteGuard({ children }) {
  const { isAuthenticated, loading, user, session } = useAuthSession();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  // Rutas que no requieren autenticación
  const publicRoutes = [
    '/',
    '/login',
    '/auth/google/callback',
    '/register',
    '/recuperar',
    '/contacto',
    '/about',
    '/home', // Temporalmente público para debugging OAuth
    // públicas visibles o livianas
    '/politica-datos',
    '/terminos',
    '/cotizador',
    '/pagos',
    '/mercadopago',
    '/mercadopago/statusbrick',
    '/test-ads',
    '/no-conexion',
    '/diagnostic'
  ];

  // Rutas que requieren permisos de admin
  const adminRoutes = [
    '/admin',
    '/admin/dashboard',
    '/admin/users',
    '/admin/settings',
    '/admin/stats'
  ];

  useEffect(() => {
    const checkAuth = () => {
      // Si está cargando, esperar
      if (loading) return;

      const isPublicRoute = publicRoutes.some(route => 
        pathname === route || pathname.startsWith(route + '/')
      );

      const isAdminRoute = adminRoutes.some(route => 
        pathname === route || pathname.startsWith(route + '/')
      );

      // Ruta pública - permitir acceso
  if (isPublicRoute) {
        setAuthorized(true);
        return;
      }

      // Usuario no autenticado - considerar sesión parcial si hay token local sin refresh
      if (!isAuthenticated) {
        const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('authToken');
        const hasRefresh = typeof window !== 'undefined' && !!localStorage.getItem('refreshToken');
        if (hasToken && !hasRefresh) {
          // Permitir acceso si hay token sin refresh para evitar rebotes inmediatos post-login
          setAuthorized(true);
          return;
        }
        // En nativo, forzar ir a /login directo para evitar cierres por deep-links
        if (Capacitor?.isNativePlatform?.()) {
          router.replace('/login');
        } else {
          router.push('/login?redirect=' + encodeURIComponent(pathname));
        }
        return;
      }

      // Ruta admin pero usuario no es admin - redirigir a home
      if (isAdminRoute && user?.role !== 'admin') {
        router.push('/home/?error=unauthorized');
        return;
      }

      // Usuario autenticado y autorizado
      setAuthorized(true);
    };

    checkAuth();
  }, [isAuthenticated, loading, user, pathname, router]);

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Mostrar contenido solo si está autorizado
  return authorized ? children : null;
}

/**
 * HOC para proteger componentes específicos
 */
export function withAuth(WrappedComponent, requireAdmin = false) {
  return function ProtectedComponent(props) {
    const { isAuthenticated, loading, user } = useAuthSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (!loading) {
        if (!isAuthenticated) {
          router.push('/login?redirect=' + encodeURIComponent(pathname));
          return;
        }
        
        if (requireAdmin && user?.role !== 'admin') {
          router.push('/home?error=unauthorized');
          return;
        }
      }
    }, [isAuthenticated, loading, user, router, pathname]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated || (requireAdmin && user?.role !== 'admin')) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

/**
 * Hook para verificar permisos específicos
 */
export function usePermissions() {
  const { user, isAuthenticated } = useAuthSession();

  return {
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    canAccess: (requiredRole) => {
      if (!isAuthenticated) return false;
      if (requiredRole === 'admin') return user?.role === 'admin';
      return true; // Usuarios autenticados pueden acceder a rutas 'user'
    },
    hasPermission: (permission) => {
      if (!isAuthenticated) return false;
      
      const permissions = {
        'view_admin_panel': user?.role === 'admin',
        'manage_users': user?.role === 'admin',
        'view_stats': user?.role === 'admin',
        'manage_settings': user?.role === 'admin',
        'create_shipments': true, // Todos los usuarios autenticados
        'view_profile': true,
        'edit_profile': true
      };
      
      return permissions[permission] || false;
    }
  };
}
