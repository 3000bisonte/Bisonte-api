// Configuración de AdMob para Bisonte Logística
// ⚠️ IMPORTANTE: Reemplaza los IDs de testing con tus IDs reales de AdMob

export const ADMOB_CONFIG = {
  // 🏠 ID de la aplicación (App ID)
  APP_ID: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' 
    ? process.env.NEXT_PUBLIC_ADMOB_APP_ID || 'ca-app-pub-1352045169606160~5443732431' // ✅ TU App ID real
    : process.env.NEXT_PUBLIC_ADMOB_TEST_APP_ID || 'ca-app-pub-3940256099942544~3347511713', // ID de testing de Google

  // 🎁 Anuncio Recompensado (para descuentos)
  REWARDED_AD_UNIT_ID: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production'
    ? process.env.NEXT_PUBLIC_ADMOB_REWARDED_ID || 'ca-app-pub-1352045169606160/7908962294' // ✅ TU Rewarded Ad ID real
    : process.env.NEXT_PUBLIC_ADMOB_TEST_REWARDED_ID || 'ca-app-pub-3940256099942544/5224354917', // ID de testing de Google

  // 📱 Banner Principal
  BANNER_AD_UNIT_ID: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production'
    ? process.env.NEXT_PUBLIC_ADMOB_BANNER_ID || 'ca-app-pub-1352045169606160/7029983134' // ✅ TU Banner Ad ID real
    : process.env.NEXT_PUBLIC_ADMOB_TEST_BANNER_ID || 'ca-app-pub-3940256099942544/6300978111', // ID de testing de Google


  // ⚙️ Configuración de recompensas
  REWARD_SETTINGS: {
    DISCOUNT_AMOUNT: 2013, // $2,013 pesos de descuento
    REWARD_TYPE: 'discount',
    CURRENCY: 'COP', // Pesos colombianos
  },

  // 🔧 Configuración técnica
  SETTINGS: {
  // Testing mode (se activa automáticamente fuera de producción)
  isTesting: (process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV) !== 'production',
    
    // Configuración de anuncios
    enableRewardedAds: true,
    enableBannerAds: true,
    enableInterstitialAds: false, // Desactivado por defecto
    
    // Timeouts y reintentos
    adTimeout: 10000, // 10 segundos
    maxRetries: 3,
    retryDelay: 2000, // 2 segundos
    
    // Frecuencia de anuncios
    interstitialFrequency: 180000, // 3 minutos entre intersticiales
    
    // Configuración de mediación
    enableMediation: true,
    eCPMFloor: 0.10, // $0.10 USD mínimo
  },

  // 🌍 Configuración por región
  REGIONAL_CONFIG: {
    CO: { // Colombia
      currency: 'COP',
      discountAmount: 2013,
      minOrderValue: 5000, // Mínimo $5,000 para mostrar anuncios
    },
    DEFAULT: {
      currency: 'USD',
      discountAmount: 1,
      minOrderValue: 2,
    }
  },

  // 📊 Analytics y tracking
  ANALYTICS: {
    trackAdImpressions: true,
    trackAdClicks: true,
    trackRewards: true,
    trackRevenue: true,
  },

  // 🎨 Configuración de UI
  UI_CONFIG: {
    showAdCountdown: true,
    showRewardPreview: true,
    showAdBadges: true,
    adLoadingText: {
      es: 'Cargando anuncio...',
      en: 'Loading ad...'
    },
    rewardText: {
      es: '¡Descuento aplicado!',
      en: 'Discount applied!'
    }
  }
};

// 🔍 Función para validar configuración
export function validateAdMobConfig() {
  const config = ADMOB_CONFIG;
  const errors = [];
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || 'development';

  // IDs de prueba conocidos de Google
  const GOOGLE_TEST_IDS = {
    APP_ID: 'ca-app-pub-3940256099942544~3347511713',
    REWARDED: 'ca-app-pub-3940256099942544/5224354917',
    BANNER: 'ca-app-pub-3940256099942544/6300978111'
  };

  // Validar App ID
  if (config.APP_ID.includes('XXXXXXXXXX')) {
    errors.push('⚠️ App ID no configurado - usando ID de testing');
  }

  // Validar Rewarded Ad ID
  if (config.REWARDED_AD_UNIT_ID.includes('XXXXXXXXXX')) {
    errors.push('⚠️ Rewarded Ad ID no configurado - usando ID de testing');
  }

  // Validar Banner Ad ID
  if (config.BANNER_AD_UNIT_ID.includes('XXXXXXXXXX')) {
    errors.push('⚠️ Banner Ad ID no configurado - usando ID de testing');
  }

  const usingTestIdsByEnv = env !== 'production';
  const usingKnownGoogleTestIds = (
    config.APP_ID === GOOGLE_TEST_IDS.APP_ID ||
    config.REWARDED_AD_UNIT_ID === GOOGLE_TEST_IDS.REWARDED ||
    config.BANNER_AD_UNIT_ID === GOOGLE_TEST_IDS.BANNER
  );

  return {
    isValid: errors.length === 0,
    errors: errors,
    isProduction: env === 'production',
    usingTestIds: usingTestIdsByEnv || usingKnownGoogleTestIds
  };
}

// 🎯 Función para obtener configuración actual
export function getCurrentAdMobConfig() {
  const validation = validateAdMobConfig();
  
  return {
    ...ADMOB_CONFIG,
    validation: validation,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  };
}

// 📝 Logs de configuración
if (typeof window !== 'undefined') {
  const validation = validateAdMobConfig();
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || 'development';

  console.group('🎯 AdMob Configuration');
  console.log('Environment:', env);
  console.log('Using Test IDs:', validation.usingTestIds);
  console.log('App ID:', ADMOB_CONFIG.APP_ID);
  console.log('Rewarded Ad ID:', ADMOB_CONFIG.REWARDED_AD_UNIT_ID);

  if (validation.errors.length > 0) {
    console.warn('⚠️ Configuration Warnings:');
    validation.errors.forEach(error => console.warn(error));
  }

  console.groupEnd();
}

export default ADMOB_CONFIG;
