"use client";
import { useEffect, useRef, useState } from "react";
import { Capacitor } from '@capacitor/core';

export default function GoogleSignInButton({ clientId, onCredential, useRedirect = true }) {
  const divRef = useRef(null);
  const loaderRef = useRef(null);
  const [showFallback, setShowFallback] = useState(false);
  const [isCapacitor, setIsCapacitor] = useState(false);
  const [runtimeClientId, setRuntimeClientId] = useState(null);

  // El clientId efectivo puede venir del prop o del runtime
  const effectiveClientId = clientId || runtimeClientId;

  useEffect(() => {
    setIsCapacitor(Capacitor.isNativePlatform());
    
    // Debug info para troubleshooting
    if (typeof window !== 'undefined') {
      console.log('GoogleSignInButton Debug:', {
        propClientId: clientId ? 'CONFIGURADO' : 'NO CONFIGURADO',
        runtimeClientId: runtimeClientId ? 'CONFIGURADO' : 'NO CONFIGURADO',
        effectiveClientId: effectiveClientId ? 'CONFIGURADO' : 'NO CONFIGURADO',
        isCapacitor: Capacitor.isNativePlatform(),
        origin: window.location.origin,
        environment: process.env.NODE_ENV
      });
    }
  }, [clientId, runtimeClientId]);

  // Fetch del clientId si no está disponible como prop
  useEffect(() => {
    if (!clientId && !runtimeClientId) {
      // En lugar de usar fetch, usar el ID hardcodeado inmediatamente en Capacitor
      if (isCapacitor) {
        const fallbackClientId = "831420252741-4191330gjs69hkm4jr55rig3d8ouas0f.apps.googleusercontent.com";
        setRuntimeClientId(fallbackClientId);
        console.log('Capacitor detectado - usando Google Client ID hardcodeado inmediatamente');
        return;
      }
      
      // Solo en web browser, intentar fetch
      fetch('/api/public/config')
        .then(res => res.json())
        .then(data => {
          if (data.googleClientId) {
            setRuntimeClientId(data.googleClientId);
            console.log('Google Client ID obtenido del servidor:', data.googleClientId.substring(0, 10) + '...');
          } else {
            console.error('No se pudo obtener Google Client ID del servidor');
            // Fallback hardcodeado para APK en caso de emergencia
            const fallbackClientId = "831420252741-4191330gjs69hkm4jr55rig3d8ouas0f.apps.googleusercontent.com";
            setRuntimeClientId(fallbackClientId);
            console.log('Usando Google Client ID hardcodeado como fallback');
          }
        })
        .catch(err => {
          console.error('Error obteniendo config:', err);
          // Fallback hardcodeado para APK en caso de emergencia
          const fallbackClientId = "831420252741-4191330gjs69hkm4jr55rig3d8ouas0f.apps.googleusercontent.com";
          setRuntimeClientId(fallbackClientId);
          console.log('Error de red - usando Google Client ID hardcodeado como fallback');
        });
    }
  }, [clientId, runtimeClientId, isCapacitor]);

  // Función para crear un botón manual de Google optimizado para WebView
  const handleManualGoogleLogin = () => {
    const clientIdToUse = effectiveClientId;
    if (!clientIdToUse) {
      console.error('No hay Client ID disponible para OAuth');
      return;
    }
    
    // Para APK local, usar la URL de producción para callback
    const baseUrl = isCapacitor ? 'https://www.bisonteapp.com' : window.location.origin;
    const googleAuthUrl = `https://accounts.google.com/oauth/authorize?client_id=${clientIdToUse}&redirect_uri=${encodeURIComponent(baseUrl + '/auth/google/callback')}&response_type=code&scope=openid%20profile%20email&access_type=offline&prompt=select_account`;
    
    console.log('Redirigiendo a Google OAuth con URL:', googleAuthUrl.substring(0, 100) + '...');
    console.log('Client ID usado:', clientIdToUse.substring(0, 10) + '...');
    console.log('Redirect URI:', baseUrl + '/auth/google/callback');
    
    // Abrir Google OAuth
    window.location.href = googleAuthUrl;
  };

  useEffect(() => {
    // Si no hay clientId, no intentamos cargar el SDK de Google
    if (!effectiveClientId) return;

    // En Capacitor, mostrar fallback más rápido y prioritario
    if (isCapacitor) {
      const fallbackTimer = setTimeout(() => {
        setShowFallback(true);
        if (loaderRef.current) {
          loaderRef.current.innerText = 'Cargando método alternativo...';
        }
      }, 1500); // Más rápido en WebView
      
      return () => clearTimeout(fallbackTimer);
    }

    // Mostrar un loader mínimo mientras carga el SDK
    if (loaderRef.current) {
      loaderRef.current.style.display = 'flex';
      loaderRef.current.innerText = 'Cargando Google Sign-In...';
    }

    // Evitar insertar múltiples veces el SDK
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    const script = existing || document.createElement("script");
    
    if (!existing) {
      console.log('Cargando Google Identity Services SDK...');
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
    } else {
      console.log('Google Identity Services SDK ya existe en el DOM');
    }
    
    let timeoutId = setTimeout(() => {
      // Si no carga en 2s en Capacitor, mostrar fallback
      if (isCapacitor) {
        setShowFallback(true);
      }
      if (loaderRef.current) {
        loaderRef.current.innerText = 'Google no disponible. Usa el botón alternativo.';
      }
    }, isCapacitor ? 2000 : 5000);
    
    script.onload = () => {
      console.log('Google Identity Services SDK cargado exitosamente');
      if (loaderRef.current) loaderRef.current.style.display = 'none';
      clearTimeout(timeoutId);
      
      // Dar un momento para que el SDK se inicialice completamente
      setTimeout(() => {
      
      try {
        if (window.google?.accounts?.id) {
          console.log('Inicializando Google Identity Services...');
          console.log('Client ID:', effectiveClientId.substring(0, 10) + '...');
          console.log('Origin:', window.location.origin);
          
          window.google.accounts.id.initialize({
            client_id: effectiveClientId,
            callback: (response) => { 
              console.log('Google GIS callback recibido:', response);
              if (response.credential) {
                // Redirigir directamente al callback con el credential
                const callbackUrl = new URL('/auth/google/callback', window.location.origin);
                callbackUrl.searchParams.set('credential', response.credential);
                callbackUrl.searchParams.set('auth_type', 'gis');
                
                console.log('Redirigiendo a callback con credential GIS...');
                window.location.href = callbackUrl.href;
              } else {
                console.error('Google GIS callback sin credential');
              }
            },
            auto_select: false,
            ux_mode: "popup",
          });
          
          console.log('Google Identity Services inicializado correctamente');
          
          if (divRef.current) {
            console.log('Renderizando botón de Google...');
            window.google.accounts.id.renderButton(divRef.current, {
              theme: "outline",
              size: "large",
              shape: "pill",
              text: "continue_with",
              logo_alignment: "left",
              width: 320,
            });
            console.log('Botón de Google renderizado');
          } else {
            console.error('divRef.current no disponible para renderizar botón');
          }
        } else {
          throw new Error('Google SDK not loaded properly - window.google.accounts.id no disponible');
        }
      } catch (error) {
        console.error('Error inicializando Google Sign-In:', error);
        console.error('Detalles del error:', {
          message: error.message,
          clientId: effectiveClientId ? 'PRESENTE' : 'AUSENTE',
          googleSDK: window.google ? 'CARGADO' : 'NO CARGADO',
          googleAccounts: window.google?.accounts ? 'PRESENTE' : 'AUSENTE',
          googleId: window.google?.accounts?.id ? 'PRESENTE' : 'AUSENTE'
        });
        
        // En cualquier error, mostrar fallback
        setShowFallback(true);
        if (loaderRef.current) {
          loaderRef.current.innerText = 'Google SDK falló. Usando método alternativo.';
        }
      }
      }, 500); // Dar 500ms para que el SDK se inicialice
    };
    
    script.onerror = (error) => {
      console.error('Error cargando Google Identity Services SDK:', error);
      clearTimeout(timeoutId);
      setShowFallback(true);
      if (loaderRef.current) {
        loaderRef.current.innerText = 'Error cargando Google SDK. Usa método alternativo.';
      }
    };
    
    if (!existing) document.head.appendChild(script);
    
    return () => {
      try {
        if (!existing && script.parentNode) script.parentNode.removeChild(script);
        clearTimeout(timeoutId);
      } catch {}
    };
  }, [effectiveClientId, onCredential, isCapacitor]);

  // Fallback visible cuando no hay clientId configurado
  if (!effectiveClientId) {
    return (
      <div className="w-full max-w-[320px] space-y-2">
        <button
          type="button"
          disabled
          title="Google Client ID no configurado"
          className="w-full h-12 flex items-center justify-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-300 cursor-not-allowed"
        >
          <GoogleIcon />
          <span>Google Sign-In no disponible</span>
        </button>
        <p className="text-xs text-red-400 text-center">
          NEXT_PUBLIC_GOOGLE_CLIENT_ID no configurado en el servidor
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Debug info para APK */}
      {isCapacitor && (
        <div className="text-xs text-yellow-400 text-center mb-2">
          🔧 Capacitor WebView | Client ID: {effectiveClientId ? '✅' : '❌'}
        </div>
      )}
      
      {/* Botón principal de Google GIS - solo mostrar en web cuando NO es Capacitor */}
      {!isCapacitor && !showFallback && (
        <div ref={divRef} style={{ display: 'block' }} />
      )}
      
      {/* Loader mientras carga - solo en web */}
      {!isCapacitor && (
        <div ref={loaderRef} className="hidden items-center justify-center text-xs text-gray-400" style={{minHeight: 20}} />
      )}
      
      {/* Botón manual - SIEMPRE en Capacitor, también como fallback en web */}
      {(isCapacitor || showFallback) && effectiveClientId && (
        <button
          type="button"
          onClick={handleManualGoogleLogin}
          className="w-[320px] h-12 flex items-center justify-center gap-3 rounded-full border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md"
        >
          <GoogleIcon />
          <span>Continuar con Google</span>
        </button>
      )}
      
      {/* Mensaje si no hay Client ID en Capacitor */}
      {isCapacitor && !effectiveClientId && (
        <div className="w-[320px] h-12 flex items-center justify-center gap-3 rounded-full border border-red-300 bg-red-50 text-red-600 font-medium">
          <GoogleIcon />
          <span>Google no configurado</span>
        </div>
      )}
      
      {/* Enlaces de ayuda */}
      <div className="flex gap-3 text-xs">
        <button 
          type="button" 
          onClick={() => window.location.reload()} 
          className="text-gray-300 underline hover:text-gray-100"
        >
          Recargar página
        </button>
        {effectiveClientId && (
          <button 
            type="button" 
            onClick={handleManualGoogleLogin}
            className="text-teal-300 underline hover:text-teal-100"
          >
            Método alternativo
          </button>
        )}
      </div>
    </div>
  );
}

// Componente del ícono de Google
function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.676 31.658 29.223 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.156 7.961 3.039l5.657-5.657C34.868 5.053 29.7 3 24 3 12.955 3 4 11.955 4 23s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.817C14.2 16.108 18.714 13 24 13c3.059 0 5.842 1.156 7.961 3.039l5.657-5.657C34.868 5.053 29.7 3 24 3 16.318 3 9.656 7.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 43c5.166 0 9.86-1.977 13.409-5.196l-6.2-5.238C29.223 35 24.67 37 24 37c-5.196 0-9.619-3.317-11.221-7.946l-6.537 5.034C9.541 39.965 16.229 43 24 43z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.104 3.178-4.538 6-11.303 6-5.196 0-9.619-3.317-11.221-7.946l-6.537 5.034C9.541 39.965 16.229 43 24 43c8.837 0 16-5.373 16-12 0-1.341-.138-2.651-.389-3.917z"/>
    </svg>
  );
}
