"use client";
import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { ADMOB_CONFIG, validateAdMobConfig } from '../config/admob.config';
import { getAdConfigForEnvironment } from '../config/web-ads.config';

/**
 * AdMobManager - Gestiona anuncios recompensados de AdMob
 * 
 * Para anuncios reales necesitas:
 * 1. Configurar tu cuenta de AdMob
 * 2. Crear una app híbrida (Cordova, Capacitor, etc.)
 * 3. Instalar el plugin de AdMob correspondiente
 * 4. Actualizar los IDs en admob.config.js
 * 
 * Este componente funciona tanto con anuncios reales como simulados
 */

class AdMobManager {
  constructor() {
    this.isInitialized = false;
    this.isAdLoaded = false;
    this.callbacks = {
      onAdLoaded: null,
      onAdClosed: null,
      onAdRewarded: null,
      onAdError: null
    };
  }

  // Detectar si estamos en un entorno con AdMob real
  hasNativeAdMob() {
    if (typeof window === 'undefined') return false;
    // Preferir plugin de Capacitor en apps nativas
    if (Capacitor?.isNativePlatform?.()) return true;
    // Compatibilidad con entornos antiguos (Cordova)
    return !!(
      window.admob ||
      window.AdMob ||
      window.plugins?.AdMob ||
      window.cordova?.plugins?.AdMob ||
      window.AndroidInterface?.hasAdMob
    );
  }

  // Detectar si estamos en modo PWA
  isPWA() {
    if (typeof window === 'undefined') return false;
    
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone ||
           document.referrer.includes('android-app://');
  }

  // Inicializar AdMob
  async initialize() {
    console.log('🚀 Inicializando AdMob Manager...');
    
    if (this.hasNativeAdMob()) {
      console.log('📱 AdMob nativo detectado');
      await this.initializeNativeAdMob();
    } else {
      console.log('🌐 Modo simulación - creando interfaz AdMob simulada');
      this.createSimulatedAdMob();
    }
    
    this.isInitialized = true;
    console.log('✅ AdMob Manager inicializado');
  }

  // Inicializar AdMob nativo (cuando está en app híbrida)
  async initializeNativeAdMob() {
    if (typeof window === 'undefined') {
      console.warn('⚠️ Window no disponible - no se puede inicializar AdMob nativo');
      return;
    }
    
    try {
      if (Capacitor?.isNativePlatform?.()) {
        // Usar plugin oficial de Capacitor Community
        const {
          AdMob,
          RewardAdPluginEvents,
        } = await import('@capacitor-community/admob');

        await AdMob.initialize();

        console.log('✅ AdMob (Capacitor) inicializado con configuración:', {
          appId: ADMOB_CONFIG.APP_ID,
          testing: ADMOB_CONFIG.SETTINGS.isTesting,
          validation: validateAdMobConfig()
        });

        // Listeners de Rewarded
        AdMob.addListener(RewardAdPluginEvents.Loaded, () => {
          console.log('📺 Rewarded cargado');
          this.isAdLoaded = true;
          this.callbacks.onAdLoaded?.();
        });

        AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
          console.log('📺 Rewarded cerrado');
          this.isAdLoaded = false;
          this.callbacks.onAdClosed?.();
        });

        AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward) => {
          console.log('🎁 Recompensa recibida (Capacitor):', reward);
          const rewardData = {
            ...reward,
            amount: ADMOB_CONFIG.REWARD_SETTINGS.DISCOUNT_AMOUNT,
            type: ADMOB_CONFIG.REWARD_SETTINGS.REWARD_TYPE,
            currency: ADMOB_CONFIG.REWARD_SETTINGS.CURRENCY
          };
          // Propagar a callbacks del manager
          this.callbacks.onAdRewarded?.(rewardData);
          // Propagar a capa de UI existente (Resumen escucha este evento)
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('adReward', { detail: rewardData }));
          }
        });
      } else {
        // Compat: intento de AdMob cordova si existe
        const admob = window.admob || window.AdMob || window.plugins?.AdMob;
        if (!admob) throw new Error('AdMob plugin nativo no disponible');

        await admob.start({
          appId: ADMOB_CONFIG.APP_ID,
          isTesting: ADMOB_CONFIG.SETTINGS.isTesting,
          initializeForRewardedVideo: true
        });

        console.log('✅ AdMob (Cordova) inicializado');

        admob.on('admob.rewardvideo.load', () => {
          this.isAdLoaded = true;
          this.callbacks.onAdLoaded?.();
        });
        admob.on('admob.rewardvideo.close', () => {
          this.isAdLoaded = false;
          this.callbacks.onAdClosed?.();
        });
        admob.on('admob.rewardvideo.reward', (reward) => {
          const rewardData = {
            ...reward,
            amount: ADMOB_CONFIG.REWARD_SETTINGS.DISCOUNT_AMOUNT,
            type: ADMOB_CONFIG.REWARD_SETTINGS.REWARD_TYPE,
            currency: ADMOB_CONFIG.REWARD_SETTINGS.CURRENCY
          };
          this.callbacks.onAdRewarded?.(rewardData);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('adReward', { detail: rewardData }));
          }
        });
        admob.on('admob.rewardvideo.fail', (error) => {
          this.isAdLoaded = false;
          this.callbacks.onAdError?.(error);
        });
      }

    } catch (error) {
      console.error('❌ Error inicializando AdMob nativo:', error);
      this.createSimulatedAdMob();
    }
  }

  // Crear interfaz simulada para desarrollo/PWA
  createSimulatedAdMob() {
    if (typeof window === 'undefined') return;
    
    const isPWA = this.isPWA();
    
    window.admob = {
      start: () => Promise.resolve(),
      
      rewardvideo: {
        config: (options) => {
          console.log('🧪 AdMob Simulado: Configurando anuncio recompensado', options);
        },
        
        load: () => {
          console.log('🧪 AdMob Simulado: Cargando anuncio recompensado...');
          setTimeout(() => {
            this.isAdLoaded = true;
            this.callbacks.onAdLoaded?.();
          }, isPWA ? 800 : 2000);
        },
        
        show: () => {
          console.log('🧪 AdMob Simulado: Mostrando anuncio recompensado');
          if (!this.isAdLoaded) {
            this.callbacks.onAdError?.('Ad not loaded');
            return;
          }
          
          // Simular secuencia de anuncio
          setTimeout(() => {
            console.log('🧪 AdMob Simulado: Anuncio completado, otorgando recompensa');
            this.callbacks.onAdRewarded?.({
              type: ADMOB_CONFIG.REWARD_SETTINGS.REWARD_TYPE,
              amount: ADMOB_CONFIG.REWARD_SETTINGS.DISCOUNT_AMOUNT,
              currency: ADMOB_CONFIG.REWARD_SETTINGS.CURRENCY
            });
            
            setTimeout(() => {
              this.isAdLoaded = false;
              this.callbacks.onAdClosed?.();
            }, 500);
          }, isPWA ? 2000 : 4000);
        },
        
        isLoaded: () => this.isAdLoaded
      },
      
      on: (event, callback) => {
        // Mapear eventos simulados
        if (event === 'admob.rewardvideo.load') this.callbacks.onAdLoaded = callback;
        if (event === 'admob.rewardvideo.close') this.callbacks.onAdClosed = callback;
        if (event === 'admob.rewardvideo.reward') this.callbacks.onAdRewarded = callback;
        if (event === 'admob.rewardvideo.fail') this.callbacks.onAdError = callback;
      }
    };
  }

  // Cargar anuncio recompensado
  async loadRewardedAd() {
    if (typeof window === 'undefined') return;
    
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (Capacitor?.isNativePlatform?.()) {
      try {
        const { AdMob } = await import('@capacitor-community/admob');
        await AdMob.prepareRewardVideoAd({
          adId: ADMOB_CONFIG.REWARDED_AD_UNIT_ID,
          isTesting: ADMOB_CONFIG.SETTINGS.isTesting,
        });
        // La carga exitosa activará el listener y marcará isAdLoaded
      } catch (e) {
        console.error('❌ Error cargando rewarded (Capacitor):', e);
        this.callbacks.onAdError?.(e);
      }
    } else {
      const admob = window.admob;
      // Configurar y cargar anuncio simulado/Cordova
      admob.rewardvideo.config({
        id: ADMOB_CONFIG.REWARDED_AD_UNIT_ID,
        isTesting: process.env.NODE_ENV !== 'production'
      });
      admob.rewardvideo.load();
    }
  }

  // Mostrar anuncio recompensado
  showRewardedAd() {
    if (typeof window === 'undefined') return false;
    
    if (!this.isInitialized) {
      console.error('❌ AdMob no está inicializado');
      return false;
    }

    if (Capacitor?.isNativePlatform?.()) {
      // El plugin gestiona el estado internamente; intentar mostrar
      import('@capacitor-community/admob').then(async ({ AdMob }) => {
        try {
          await AdMob.showRewardVideoAd();
        } catch (e) {
          console.warn('⚠️ No se pudo mostrar el rewarded (Capacitor):', e);
        }
      });
      return true;
    } else {
      const admob = window.admob;
      if (!admob.rewardvideo.isLoaded()) {
        console.warn('⚠️ Anuncio no está cargado');
        return false;
      }
      admob.rewardvideo.show();
      return true;
    }
  }

  // Verificar si hay anuncio cargado
  isRewardedAdLoaded() {
    return this.isAdLoaded;
  }

  // Configurar callbacks
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }
}

// Instancia singleton
const adMobManager = new AdMobManager();

// Hook personalizado para usar AdMob
export function useAdMob() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [adConfig, setAdConfig] = useState(null);

  useEffect(() => {
    // Detectar configuración de anuncios apropiada para el entorno
    const config = getAdConfigForEnvironment();
    setAdConfig(config);
  }, []);

  const loadAd = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (adConfig?.useAdMob) {
        await adMobManager.loadRewardedAd();
      } else if (adConfig?.useWebAds) {
        // Para anuncios web, simular carga inmediata
        setTimeout(() => {
          setIsLoaded(true);
          setIsLoading(false);
        }, 500);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [adConfig]);

  const showAd = useCallback(() => {
    if (adConfig?.useAdMob) {
      return adMobManager.showRewardedAd();
    } else if (adConfig?.useWebAds) {
      // Simular anuncio web con recompensa
      console.log('🌐 Simulando anuncio web con recompensa');
      setTimeout(() => {
        // Simular recompensa después de "ver" el anuncio
        const reward = {
          type: 'discount',
          amount: 5000,
          currency: 'COP'
        };
        
        // Disparar evento de recompensa
        const event = new CustomEvent('webAdRewarded', { detail: reward });
        window.dispatchEvent(event);
        
        // Marcar como no cargado para requerir nueva carga
        setIsLoaded(false);
      }, 2000);
      return true;
    }
    return false;
  }, [adConfig]);

  useEffect(() => {
    if (!adConfig) return;
    
    if (adConfig.useAdMob) {
      // Configurar callbacks para AdMob
      adMobManager.setCallbacks({
        onAdLoaded: () => {
          setIsLoaded(true);
          setIsLoading(false);
        },
        onAdClosed: () => {
          setIsLoaded(false);
          // Precargar el siguiente anuncio
          setTimeout(loadAd, 1000);
        },
        onAdRewarded: (reward) => {
          console.log('🎁 Recompensa AdMob recibida en hook:', reward);
          // Este evento se maneja en el componente padre
        },
        onAdError: (error) => {
          setError(error);
          setIsLoaded(false);
          setIsLoading(false);
        }
      });

      // Inicializar y cargar primer anuncio
      adMobManager.initialize().then(() => {
        loadAd();
      });
    } else if (adConfig.useWebAds) {
      // Para anuncios web, configurar listener de eventos
      const handleWebAdReward = (event) => {
        console.log('🌐 Recompensa web recibida en hook:', event.detail);
        // Este evento se maneja en el componente padre
      };
      
      window.addEventListener('webAdRewarded', handleWebAdReward);
      
      // Cargar "anuncio" web inmediatamente
      loadAd();
      
      return () => {
        window.removeEventListener('webAdRewarded', handleWebAdReward);
      };
    }
  }, [loadAd, adConfig]);

  return {
    isLoaded,
    isLoading,
    error,
    loadAd,
    showAd,
    hasNativeAdMob: adMobManager.hasNativeAdMob(),
    isPWA: adMobManager.isPWA(),
    adConfig,
    adType: adConfig?.type || 'unknown'
  };
}

export default adMobManager;
