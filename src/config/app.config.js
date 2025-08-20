// Sistema de configuración robusta para producción
export const CONFIG = {
  // URLs de API - IMPORTANTE: Actualizar cuando cambie el deployment
  API: {
    BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://bisonte-gkcqbupdj-eduardos-projects-9d27e028.vercel.app/api',
    FALLBACK_URLS: [
      'https://bisonte-gkcqbupdj-eduardos-projects-9d27e028.vercel.app/api',
      'https://api-bisonte.vercel.app/api', // URL personalizada cuando esté configurada
    ]
  },

  // Configuración de seguridad
  SECURITY: {
    ENABLE_HTTPS_ONLY: true,
    API_TIMEOUT: 15000, // 15 segundos
    MAX_RETRIES: 3,
    VALIDATE_SSL: true
  },

  // AdMob - IDs de producción REALES
  ADMOB: {
    APP_ID: process.env.NEXT_PUBLIC_ADMOB_APP_ID || 'ca-app-pub-1352045169606160~5443732431',
    BANNER_ID: process.env.NEXT_PUBLIC_ADMOB_BANNER_ID || 'ca-app-pub-1352045169606160/7029983134',
    REWARDED_ID: process.env.NEXT_PUBLIC_ADMOB_REWARDED_ID || 'ca-app-pub-1352045169606160/7908962294',
    // IDs de test para desarrollo
    TEST: {
      APP_ID: 'ca-app-pub-3940256099942544~3347511713',
      BANNER_ID: 'ca-app-pub-3940256099942544/6300978111',
      REWARDED_ID: 'ca-app-pub-3940256099942544/5224354917'
    }
  },

  // MercadoPago - Credenciales de producción REALES
  MERCADOPAGO: {
    PUBLIC_KEY: process.env.NEXT_PUBLIC_INIT_MERCADOPAGO || 'APP_USR-4d095f52-0750-4228-a8b7-c95781228b82',
    ACCESS_TOKEN: process.env.M_P_PUBLIC_KEY || 'APP_USR-7839331562891156-092513-2bb2d8196ae1ae38270db99be52fbb6c-1849562998',
    ENVIRONMENT: 'production', // 'production' o 'test'
    LOCALE: 'es-CO',
    CURRENCY: 'COP'
  },

  // Configuración de la aplicación
  APP: {
    NAME: 'Bisonte Logística',
    VERSION: '1.0.0',
    ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || 'production',
    DEBUG: process.env.NODE_ENV === 'development',
    COMPANY: 'Bisonte Logística SAS',
    SUPPORT_EMAIL: 'soporte@bisontelogistica.com'
  },

  // Validaciones de seguridad
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
    MIN_PASSWORD_LENGTH: 8,
    MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  },

  // URLs importantes
  URLS: {
    PRIVACY_POLICY: 'https://bisontelogistica.com/privacidad',
    TERMS_OF_SERVICE: 'https://bisontelogistica.com/terminos',
    SUPPORT: 'https://bisontelogistica.com/soporte',
    WEBSITE: 'https://bisontelogistica.com'
  }
};

// Función para verificar si estamos en modo de producción
export const isProduction = () => {
  return CONFIG.APP.ENVIRONMENT === 'production' && !CONFIG.APP.DEBUG;
};

// Función para obtener IDs de AdMob según el ambiente
export const getAdMobIds = () => {
  if (isProduction()) {
    return {
      appId: CONFIG.ADMOB.APP_ID,
      bannerId: CONFIG.ADMOB.BANNER_ID,
      rewardedId: CONFIG.ADMOB.REWARDED_ID
    };
  } else {
    return CONFIG.ADMOB.TEST;
  }
};

// Función para obtener credenciales de MercadoPago
export const getMercadoPagoConfig = () => {
  return {
    publicKey: CONFIG.MERCADOPAGO.PUBLIC_KEY,
    environment: CONFIG.MERCADOPAGO.ENVIRONMENT,
    locale: CONFIG.MERCADOPAGO.LOCALE
  };
};

// Función para hacer requests seguros a la API
export const secureApiRequest = async (endpoint, options = {}) => {
  const { API, SECURITY } = CONFIG;
  
  const defaultOptions = {
    timeout: SECURITY.API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': `${CONFIG.APP.NAME}/${CONFIG.APP.VERSION}`,
      ...options.headers
    },
    ...options
  };

  let lastError;
  
  // Intentar con URL principal primero
  for (let i = 0; i < SECURITY.MAX_RETRIES; i++) {
    try {
      const url = `${API.BASE_URL}${endpoint}`;
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      lastError = error;
      console.warn(`Intento ${i + 1} fallido:`, error.message);
      
      if (i < SECURITY.MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Backoff
      }
    }
  }
  
  throw new Error(`API request failed after ${SECURITY.MAX_RETRIES} attempts: ${lastError.message}`);
};

export default CONFIG;
