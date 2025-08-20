// Configuración para anuncios web (AdSense) como alternativa a AdMob
// Se usa cuando la app se ejecuta en navegador web (PWA)

export const WEB_ADS_CONFIG = {
  // 🌐 Google AdSense para PWA
  ADSENSE: {
    CLIENT_ID: 'ca-pub-1352045169606160', // Tu Google AdSense ID
    SLOT_IDS: {
      BANNER: '1234567890', // Reemplaza con tu Slot ID real
      RECTANGLE: '0987654321', // Para anuncios más grandes
      RESPONSIVE: '1122334455' // Para anuncios responsivos
    }
  },

  // 🎯 Configuración de anuncios web
  WEB_AD_SETTINGS: {
    enableAdSense: true,
    enableGoogleAds: true,
    enableFacebookAds: false, // Desactivado por defecto
    
    // Configuración de frecuencia
    bannerRefreshRate: 30000, // 30 segundos
    maxAdsPerPage: 3,
    
    // Configuración de recompensas simuladas para PWA
    simulatedRewards: {
      enabled: true,
      amount: 2013,
      currency: 'COP',
      probability: 1.0 // 100% para testing
    }
  },

  // 🎨 Estilos para anuncios web
  AD_STYLES: {
    banner: {
      width: '100%',
      height: '250px',
      display: 'block',
      margin: '10px auto'
    },
    
    rectangle: {
      width: '300px',
      height: '250px',
      display: 'inline-block',
      margin: '10px'
    }
  },

  // 🔍 Detección de entorno
  ENVIRONMENT_DETECTION: {
    isWebBrowser: () => typeof window !== 'undefined' && !window.cordova,
    isPWA: () => {
      if (typeof window === 'undefined') return false;
      return window.matchMedia('(display-mode: standalone)').matches ||
             window.navigator.standalone;
    },
    isMobileWebView: () => {
      if (typeof window === 'undefined') return false;
      return /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);
    }
  }
};

// 🎯 Función para obtener configuración según el entorno
export function getAdConfigForEnvironment() {
  const env = WEB_ADS_CONFIG.ENVIRONMENT_DETECTION;
  
  if (env.isPWA()) {
    return {
      type: 'PWA',
      useAdMob: false,
      useWebAds: true,
      config: WEB_ADS_CONFIG
    };
  }
  
  if (env.isMobileWebView()) {
    return {
      type: 'WebView',
      useAdMob: false,
      useWebAds: true,
      config: WEB_ADS_CONFIG
    };
  }
  
  if (env.isWebBrowser()) {
    return {
      type: 'Browser',
      useAdMob: false,
      useWebAds: true,
      config: WEB_ADS_CONFIG
    };
  }
  
  return {
    type: 'Unknown',
    useAdMob: false,
    useWebAds: false,
    config: null
  };
}

export default WEB_ADS_CONFIG;
