"use client";
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/libs/api-client';

/**
 * Hook avanzado de autenticación con refresh tokens
 */
export function useAuthSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar sesión del almacenamiento local
  const loadStoredSession = useCallback(() => {
    try {
      const token = localStorage.getItem('authToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        setSession({
          user,
          token,
          refreshToken,
          authenticated: true
        });
        apiClient.setAuthToken(token);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error cargando sesión:', err);
      clearSession();
      return false;
    }
  }, []);

  // Limpiar sesión
  const clearSession = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('bisonte_mobile_session');
    apiClient.removeAuthToken();
    setSession(null);
    setError(null);
  }, []);

  // Renovar tokens automáticamente
  const refreshTokens = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
  throw new Error('No refresh token available');
      }

      const response = await fetch(apiClient.getApiBaseUrl() + '/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error('Refresh failed');
      }

      const data = await response.json();
      
      // Actualizar tokens
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      apiClient.setAuthToken(data.token);
      
      // Actualizar sesión
      setSession(prev => prev ? {
        ...prev,
        token: data.token,
        refreshToken: data.refreshToken
      } : null);
      
      return data.token;
    } catch (err) {
      console.error('Error renovando tokens:', err);
  // No limpiar sesión aquí; dejar que el validador decida qué hacer
  throw err;
    }
  }, [clearSession]);

  // Validar sesión con el servidor
  const validateSession = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/auth/session');
      
      if (response.authenticated && response.user) {
        // Actualizar datos de usuario si han cambiado
        const userData = JSON.stringify(response.user);
        if (localStorage.getItem('user') !== userData) {
          localStorage.setItem('user', userData);
          setSession(prev => prev ? { ...prev, user: response.user } : null);
        }
        return true;
      } else {
        clearSession();
        return false;
      }
    } catch (err) {
      // Si falla por token expirado, intentar refresh
      if (err.message?.includes('401') || err.message?.includes('No autorizado')) {
        const hasRefresh = !!localStorage.getItem('refreshToken');
        if (hasRefresh) {
          try {
            await refreshTokens();
            return await validateSession(); // Reintentar después del refresh
          } catch (refreshErr) {
            clearSession();
            return false;
          }
        } else {
          // No hay refreshToken; evitar limpiar sesión para no causar bucles de redirección.
          console.warn('Validación falló con 401 pero no hay refreshToken; manteniendo sesión local.');
          return true;
        }
      }
      throw err;
    }
  }, [clearSession, refreshTokens]);

  // Iniciar sesión
  const signIn = useCallback(async (credentials, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (options.provider === 'google') {
        response = await apiClient.post('/api/auth/google', credentials);
      } else {
        response = await apiClient.post('/api/auth/login', credentials);
      }
      
      if (response.success && response.token) {
        // Guardar tokens y usuario
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Compatibilidad con useMobileSession
        localStorage.setItem('bisonte_mobile_session', JSON.stringify({
          user: response.user,
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }));
        
        apiClient.setAuthToken(response.token);
        
        setSession({
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
          authenticated: true
        });
        
        return { success: true, user: response.user };
      } else {
        throw new Error(response.error || 'Credenciales inválidas');
      }
    } catch (err) {
      const errorMsg = err.message || 'Error al iniciar sesión';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cerrar sesión
  const signOut = useCallback(async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (err) {
      // Ignorar errores de logout
    } finally {
      clearSession();
    }
  }, [clearSession]);

  // Configurar renovación automática
  useEffect(() => {
    let refreshInterval;
    
    if (session?.token) {
      // Renovar tokens cada 10 minutos (tokens expiran en 15m)
      refreshInterval = setInterval(async () => {
        try {
          await refreshTokens();
        } catch (err) {
          console.error('Auto-refresh failed:', err);
        }
      }, 10 * 60 * 1000);
    }
    
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [session?.token, refreshTokens]);

  // Inicialización
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Cargar sesión almacenada
        const hasStoredSession = loadStoredSession();
        
        if (hasStoredSession) {
          // Validar con servidor
          await validateSession();
        }
      } catch (err) {
        console.error('Error inicializando sesión:', err);
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, [loadStoredSession, validateSession, clearSession]);

  return {
    session,
    loading,
    error,
    signIn,
    signOut,
    refreshTokens,
    validateSession,
    isAuthenticated: !!session?.authenticated,
    user: session?.user || null,
    // Compatibilidad con useAuth
    isLoading: loading,
    login: signIn,
    logout: signOut
  };
}
