"use client";

import { useState, useEffect, useCallback } from 'react';

// Función de utilidad para obtener datos de localStorage con logging
const getFromLocalStorage = (key) => {
  try {
    console.log(`🔍 GETTING from localStorage: ${key}`);
    const value = localStorage.getItem(key);
    console.log(`📦 Value for ${key}:`, value ? `${value.substring(0, 50)}...` : 'NULL');
    return value;
  } catch (error) {
    console.error(`❌ Error getting ${key} from localStorage:`, error);
    return null;
  }
};

// Función para parsear JSON con manejo de errores
const safeJsonParse = (jsonString, fallback = null) => {
  try {
    return jsonString ? JSON.parse(jsonString) : fallback;
  } catch (error) {
    console.error('❌ Error parsing JSON:', error);
    return fallback;
  }
};

// Función para crear sesión desde localStorage
const createSessionFromStorage = () => {
  console.log('🔄 CREATING SESSION FROM STORAGE - Checking all sources...');
  
  // Verificar múltiples fuentes de datos
  const sources = [
    'bisonte_mobile_session',
    'google_auth_data', 
    'session_data',
    'user'
  ];
  
  sources.forEach(source => {
    const data = getFromLocalStorage(source);
    console.log(`📊 Source ${source}:`, data ? 'FOUND' : 'EMPTY');
  });

  // Intentar con bisonte_mobile_session primero
  const mobileSession = getFromLocalStorage('bisonte_mobile_session');
  if (mobileSession) {
    const sessionData = safeJsonParse(mobileSession);
    if (sessionData && sessionData.user) {
      console.log('✅ Found valid mobile session:', sessionData);
      return sessionData;
    }
  }

  // Intentar con google_auth_data
  const googleAuthData = getFromLocalStorage('google_auth_data');
  if (googleAuthData) {
    const authData = safeJsonParse(googleAuthData);
    if (authData && authData.user) {
      console.log('✅ Found valid Google auth data:', authData);
      return {
        user: authData.user,
        token: authData.tokens?.access_token,
        refreshToken: authData.tokens?.refresh_token,
        expires: authData.expires_at ? new Date(authData.expires_at).toISOString() : null,
        created: new Date().toISOString()
      };
    }
  }

  // Intentar con session_data
  const sessionData = getFromLocalStorage('session_data');
  if (sessionData) {
    const sData = safeJsonParse(sessionData);
    if (sData && sData.email) {
      console.log('✅ Found valid session data:', sData);
      return {
        user: {
          id: sData.id,
          email: sData.email,
          name: sData.name,
          picture: sData.picture
        },
        token: sData.access_token,
        refreshToken: sData.refresh_token,
        expires: sData.expires_at ? new Date(sData.expires_at).toISOString() : null,
        created: new Date().toISOString()
      };
    }
  }

  // Intentar construir desde datos básicos
  const user = getFromLocalStorage('user');
  const authToken = getFromLocalStorage('authToken');
  
  if (user && authToken) {
    const userData = safeJsonParse(user);
    if (userData && userData.email) {
      console.log('✅ Building session from basic data:', userData);
      return {
        user: userData,
        token: authToken,
        refreshToken: getFromLocalStorage('refreshToken'),
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created: new Date().toISOString()
      };
    }
  }

  console.log('❌ No valid session data found in any source');
  return null;
};

export const useMobileSession = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para inspeccionar localStorage completo
  const inspectLocalStorage = useCallback(() => {
    console.log('🔍 === COMPLETE LOCALSTORAGE INSPECTION ===');
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        console.log(`📝 ${key}:`, value ? `${value.substring(0, 100)}${value.length > 100 ? '...' : ''}` : 'empty');
      }
    } catch (error) {
      console.error('❌ Error inspecting localStorage:', error);
    }
    console.log('🔍 === END LOCALSTORAGE INSPECTION ===');
  }, []);

  // Función para verificar sesión
  const checkSession = useCallback(() => {
    console.log('🔄 CHECKING SESSION...');
    
    try {
      inspectLocalStorage();
      
      const sessionData = createSessionFromStorage();
      
      if (sessionData) {
        console.log('✅ Session found and validated:', sessionData);
        setSession(sessionData);
      } else {
        console.log('❌ No valid session found');
        setSession(null);
      }
    } catch (error) {
      console.error('❌ Error checking session:', error);
      setSession(null);
    } finally {
      setLoading(false);
      console.log('🏁 Session check completed');
    }
  }, [inspectLocalStorage]);

  // Función de logout
  const signOut = useCallback(() => {
    console.log('🚪 SIGNING OUT...');
    
    try {
      // Limpiar todos los datos de autenticación
      const keysToRemove = [
        'bisonte_mobile_session',
        'google_auth_data',
        'session_data',
        'authToken',
        'refreshToken',
        'user',
        'user_email',
        'user_name',
        'auth_timestamp',
        'auth_success',
        'oauth_completed'
      ];
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          console.log(`🗑️ Removed: ${key}`);
        } catch (error) {
          console.error(`❌ Error removing ${key}:`, error);
        }
      });
      
      setSession(null);
      console.log('✅ Logout completed');
      
    } catch (error) {
      console.error('❌ Error during logout:', error);
    }
  }, []);

  // Hook principal de efecto
  useEffect(() => {
    console.log('🚀 useMobileSession HOOK INITIALIZED');
    
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') {
      console.log('⚠️ Running on server, skipping session check');
      return;
    }

    // Verificar sesión inmediatamente
    checkSession();

    // Escuchar cambios en localStorage (para múltiples pestañas)
    const handleStorageChange = (e) => {
      console.log('📢 Storage changed:', e.key, e.newValue ? 'SET' : 'REMOVED');
      if (e.key && e.key.includes('session') || e.key === 'authToken' || e.key === 'user') {
        console.log('🔄 Session-related storage changed, rechecking...');
        checkSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkSession]);

  // Función de utilidad para debug
  const debugSession = useCallback(() => {
    console.log('🐛 === SESSION DEBUG INFO ===');
    console.log('Current session:', session);
    console.log('Loading state:', loading);
    inspectLocalStorage();
    console.log('🐛 === END DEBUG INFO ===');
  }, [session, loading, inspectLocalStorage]);

  // Retornar la interfaz del hook
  return {
    data: session,
    loading,
    signOut,
    checkSession,
    debugSession,
    inspectLocalStorage
  };
};
