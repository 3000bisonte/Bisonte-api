import { useState, useEffect } from 'react';

export function useMobileSession() {
  const [session, setSession] = useState({ data: null, status: 'loading' });

  useEffect(() => {
    console.log('🔐 useSession: iniciando verificación...');
    
    // Delay para asegurar que localStorage esté disponible y LoginForm termine
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('user');
      
      console.log('🔍 Verificando localStorage:', { 
        hasToken: !!token, 
        hasUser: !!user,
        token: token ? token.substring(0, 10) + '...' : null
      });
      
      if (token && user) {
        try {
          const userData = JSON.parse(user);
          console.log('✅ Datos de usuario encontrados:', userData);
          setSession({
            data: {
              user: userData,
              token: token
            },
            status: 'authenticated'
          });
        } catch (error) {
          console.error('❌ Error parsing user data:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setSession({ data: null, status: 'unauthenticated' });
        }
      } else {
        console.log('❌ No se encontraron datos de autenticación');
        setSession({ data: null, status: 'unauthenticated' });
      }
    };

    // Verificar inmediatamente si estamos en el browser
    if (typeof window !== 'undefined') {
      setTimeout(checkAuth, 300); // Delay más largo para asegurar que LoginForm termine
    }
  }, []);

  return session;
}

export function signOut() {
  localStorage.removeItem('authToken'); // Cambiado de 'token' a 'authToken'
  localStorage.removeItem('user');
  localStorage.removeItem('lastUser');
  window.location.href = '/';
}

export function signIn() {
  window.location.href = '/';
}

// Compatibilidad: alias similar a next-auth's useSession
export function useSession() {
  const session = useMobileSession();
  // Mapear al shape de next-auth: { data, status }
  return { data: session.data, status: session.status };
}
