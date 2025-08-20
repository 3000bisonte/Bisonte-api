import { useState, useEffect } from 'react';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function GoogleSignInButtonNative({ onCredential, clientId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isNative, setIsNative] = useState(false);
  const [effectiveClientId, setEffectiveClientId] = useState(null);

  useEffect(() => {
    // Detectar si estamos en un entorno nativo
    setIsNative(Capacitor.isNativePlatform());
    
    // Establecer el Client ID - Usar variable de entorno o valor por defecto
    const googleClientId = clientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
    setEffectiveClientId(googleClientId);
    
    console.log('🔧 GoogleSignInButtonNative inicializado:', {
      isNative: Capacitor.isNativePlatform(),
      platform: Capacitor.getPlatform(),
      clientId: googleClientId ? 'CONFIGURADO' : 'NO CONFIGURADO',
      origin: typeof window !== 'undefined' ? window.location.origin : 'server'
    });
  }, [clientId]);

  useEffect(() => {
    if (!isNative) return;

    // Listener para cuando el browser se cierre (usuario regresa a la app)
    const handleBrowserFinished = () => {
      console.log('🔄 Browser cerrado, verificando autenticación...');
      setLoading(false);
      
      // Verificar si hay datos de autenticación en localStorage después de un pequeño delay
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          const authSuccess = localStorage.getItem('google_auth_success');
          const authData = localStorage.getItem('google_auth_data');
          const authToken = localStorage.getItem('authToken');
          
          console.log('📊 Verificando datos de autenticación:', {
            authSuccess: !!authSuccess,
            authData: !!authData,
            authToken: !!authToken
          });
          
          if (authSuccess || authData || authToken) {
            console.log('✅ Autenticación detectada, navegando a home...');
            window.location.href = '/home';
          } else {
            console.log('⚠️ No se detectó autenticación, permaneciendo en login');
          }
        }
      }, 1000);
    };

    // Listener para cuando la app vuelve al foreground
    const handleAppStateChange = (state) => {
      if (state.isActive && loading) {
        console.log('📱 App volvió al foreground durante OAuth, verificando...');
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            const authSuccess = localStorage.getItem('google_auth_success');
            if (authSuccess) {
              console.log('✅ Autenticación completada mientras app estaba en background');
              window.location.href = '/home';
            }
          }
        }, 500);
      }
    };

    // Registrar listeners
    Browser.addListener('browserFinished', handleBrowserFinished);
    App.addListener('appStateChange', handleAppStateChange);
    
    return () => {
      Browser.removeAllListeners();
      App.removeAllListeners();
    };
  }, [isNative, loading]);

  const handleNativeGoogleSignIn = async () => {
    if (!effectiveClientId) {
      setError('Client ID no configurado');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Iniciando autenticación nativa con Google...');
      
      // Usar URL web que sabemos que funciona (configurada en Google Cloud Console)
      const params = new URLSearchParams({
        client_id: effectiveClientId,
        redirect_uri: 'https://www.bisonteapp.com/auth/google/callback',
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'select_account',
        state: Date.now().toString() // Para prevenir CSRF
      });
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
      
      console.log('🌐 Abriendo OAuth con redirect web:', {
        redirect_uri: 'https://www.bisonteapp.com/auth/google/callback',
        client_id: effectiveClientId.substring(0, 10) + '...'
      });
      
      // Abrir en navegador externo
      await Browser.open({ 
        url: authUrl,
        windowName: 'Bisonte_OAuth',
        toolbarColor: '#1e3c72',
        presentationStyle: 'popover'
      });
      
    } catch (error) {
      console.error('❌ Error al abrir OAuth:', error);
      setError('Error al abrir autenticación');
      setLoading(false);
    }
  };

  const handleWebGoogleSignIn = () => {
    // Para web, usar el método tradicional
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      console.warn('⚠️ Google Identity Services no disponible en web');
      // Fallback manual para web
      const params = new URLSearchParams({
        client_id: effectiveClientId,
        redirect_uri: window.location.origin + '/auth/google/callback',
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'select_account'
      });
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
      window.location.href = authUrl;
    }
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center gap-4 p-6 border border-blue-300 rounded-xl shadow-lg bg-gradient-to-r from-blue-50 to-green-50">
        <div className="animate-spin w-8 h-8 border-3 border-blue-300 border-t-blue-600 rounded-full"></div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Autenticando con Google</h3>
          <p className="text-sm text-blue-600 mb-3">Completa la autenticación en el navegador</p>
          
          {/* Instrucciones para móvil */}
          {isNative && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
              <h4 className="font-semibold text-amber-800 mb-2">📱 Instrucciones:</h4>
              <ol className="text-sm text-amber-700 space-y-1">
                <li>1. Completa la autenticación en el navegador</li>
                <li>2. Después del éxito, <strong>regresa a la app</strong></li>
                <li>3. Si no redirige automáticamente, cierra el navegador</li>
              </ol>
            </div>
          )}
        </div>
        
        {/* Botón de cancelar */}
        <button
          onClick={() => {
            setLoading(false);
            Browser.close();
          }}
          className="text-sm text-gray-500 hover:text-red-600 underline"
        >
          Cancelar autenticación
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Información de debug para desarrollo */}
      {isNative && (
        <div className="text-xs text-blue-400 text-center mb-2">
          🔧 Modo Temporal Web | Client ID: {effectiveClientId ? '✅' : '❌'}
          <div className="text-yellow-300 mt-1">
            ⚠️ Usando web redirect temporal hasta configurar deep links
          </div>
        </div>
      )}
      
      {/* Botón principal */}
      <button
        type="button"
        onClick={isNative ? handleNativeGoogleSignIn : handleWebGoogleSignIn}
        disabled={loading || !effectiveClientId}
        className="w-full max-w-sm flex items-center justify-center gap-3 px-4 py-3 border-2 border-green-500 rounded-lg shadow-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <GoogleIcon />
        <span className="font-bold text-white text-lg">
          {isNative ? '🚀 CONTINUAR CON GOOGLE (TEMPORAL WEB)' : '🚀 CONTINUAR CON GOOGLE'}
        </span>
      </button>
      
      {/* Mensaje de error */}
      {error && (
        <p className="text-sm text-red-600 text-center max-w-sm">{error}</p>
      )}
      
      {/* Información adicional para desarrollo */}
      <div className="flex gap-3 text-xs text-gray-400">
        <span>Plataforma: {isNative ? Capacitor.getPlatform() : 'Web'}</span>
        {isNative && (
          <span>OAuth: Browser externo</span>
        )}
      </div>
    </div>
  );
}
