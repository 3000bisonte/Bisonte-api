"use client";
import { useEffect, useState } from 'react';
import { getCurrentAdMobConfig } from '../config/admob.config';
import { getAdConfigForEnvironment } from '../config/web-ads.config';

export default function AdDebugInfo() {
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    // Solo mostrar en desarrollo o cuando se presione una tecla especial
    const isDev = process.env.NODE_ENV === 'development';
    
    if (typeof window !== 'undefined') {
      const admobConfig = getCurrentAdMobConfig();
      const webAdConfig = getAdConfigForEnvironment();
      
      const info = {
        environment: {
          nodeEnv: process.env.NODE_ENV || 'development',
          isSSR: typeof window === 'undefined',
          userAgent: navigator.userAgent,
          url: window.location.href
        },
        admob: {
          hasNativeAdMob: !!(
            window.admob || 
            window.AdMob || 
            window.plugins?.AdMob ||
            window.cordova?.plugins?.AdMob
          ),
          appId: admobConfig.APP_ID,
          rewardedId: admobConfig.REWARDED_AD_UNIT_ID,
          bannerId: admobConfig.BANNER_AD_UNIT_ID,
          validation: admobConfig.validation
        },
        webAds: webAdConfig,
        pwa: {
          isStandalone: window.matchMedia('(display-mode: standalone)').matches,
          isNavigatorStandalone: window.navigator.standalone || false,
          hasServiceWorker: 'serviceWorker' in navigator,
          isInstalled: window.matchMedia('(display-mode: standalone)').matches
        },
        device: {
          isMobile: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent),
          isAndroid: /Android/.test(navigator.userAgent),
          isIOS: /iPhone|iPad/.test(navigator.userAgent),
          platform: navigator.platform
        }
      };
      
      setDebugInfo(info);
      
      // Mostrar automáticamente en desarrollo
      if (isDev) {
        setShowDebug(true);
      }
      
      // Tecla de atajo para mostrar debug (Alt + D)
      const handleKeyDown = (e) => {
        if (e.altKey && e.key === 'd') {
          setShowDebug(prev => !prev);
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  if (!debugInfo || !showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDebug(true)}
          className="bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-50 hover:opacity-100"
        >
          Debug (Alt+D)
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-black/90 text-white p-4 rounded-lg text-xs max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-sm">🔍 Debug Info</h3>
          <button
            onClick={() => setShowDebug(false)}
            className="text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-3">
          {/* Entorno */}
          <div>
            <h4 className="text-yellow-400 font-semibold">🌍 Entorno:</h4>
            <p>Modo: <span className="text-green-400">{debugInfo.environment.nodeEnv}</span></p>
            <p>URL: <span className="text-blue-400">{debugInfo.environment.url}</span></p>
          </div>
          
          {/* AdMob */}
          <div>
            <h4 className="text-yellow-400 font-semibold">📱 AdMob:</h4>
            <p>Nativo: <span className={debugInfo.admob.hasNativeAdMob ? "text-green-400" : "text-red-400"}>
              {debugInfo.admob.hasNativeAdMob ? "✅ Disponible" : "❌ No disponible"}
            </span></p>
            <p>App ID: <span className="text-purple-400 break-all">{debugInfo.admob.appId}</span></p>
            <p>Rewarded: <span className="text-purple-400 break-all">{debugInfo.admob.rewardedId}</span></p>
            <p>Test IDs: <span className={debugInfo.admob.validation.usingTestIds ? "text-yellow-400" : "text-green-400"}>
              {debugInfo.admob.validation.usingTestIds ? "Sí" : "No"}
            </span></p>
          </div>
          
          {/* PWA */}
          <div>
            <h4 className="text-yellow-400 font-semibold">🏠 PWA:</h4>
            <p>Standalone: <span className={debugInfo.pwa.isStandalone ? "text-green-400" : "text-red-400"}>
              {debugInfo.pwa.isStandalone ? "Sí" : "No"}
            </span></p>
            <p>Instalada: <span className={debugInfo.pwa.isInstalled ? "text-green-400" : "text-red-400"}>
              {debugInfo.pwa.isInstalled ? "Sí" : "No"}
            </span></p>
            <p>Service Worker: <span className={debugInfo.pwa.hasServiceWorker ? "text-green-400" : "text-red-400"}>
              {debugInfo.pwa.hasServiceWorker ? "Sí" : "No"}
            </span></p>
          </div>
          
          {/* Anuncios Web */}
          <div>
            <h4 className="text-yellow-400 font-semibold">🌐 Anuncios:</h4>
            <p>Tipo: <span className="text-blue-400">{debugInfo.webAds.type}</span></p>
            <p>Usar AdMob: <span className={debugInfo.webAds.useAdMob ? "text-green-400" : "text-red-400"}>
              {debugInfo.webAds.useAdMob ? "Sí" : "No"}
            </span></p>
            <p>Usar Web: <span className={debugInfo.webAds.useWebAds ? "text-green-400" : "text-red-400"}>
              {debugInfo.webAds.useWebAds ? "Sí" : "No"}
            </span></p>
          </div>
          
          {/* Dispositivo */}
          <div>
            <h4 className="text-yellow-400 font-semibold">📱 Dispositivo:</h4>
            <p>Móvil: <span className={debugInfo.device.isMobile ? "text-green-400" : "text-red-400"}>
              {debugInfo.device.isMobile ? "Sí" : "No"}
            </span></p>
            <p>Plataforma: <span className="text-blue-400">{debugInfo.device.platform}</span></p>
          </div>
        </div>
        
        <div className="mt-3 pt-2 border-t border-gray-600">
          <p className="text-gray-400 text-xs">
            💡 Para anuncios reales de AdMob necesitas una app híbrida (Cordova/Capacitor)
          </p>
        </div>
      </div>
    </div>
  );
}
