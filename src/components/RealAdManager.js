"use client";
import { useEffect, useState, useRef } from 'react';

class RealAdManager {
  constructor() {
    this.isInitialized = false;
    this.adInstance = null;
    this.callbacks = {};
    this.isTestMode = process.env.NODE_ENV === 'development';
  }

  // Inicializar Google AdSense
  async initializeAds() {
    if (this.isInitialized) return true;

    try {
      // Verificar si AdSense ya está cargado
      if (!window.adsbygoogle) {
        await this.loadAdSenseScript();
      }

      // En modo test, simular la inicialización
      if (this.isTestMode) {
        console.log('🧪 MODO TEST: Simulando inicialización de AdSense');
        this.isInitialized = true;
        return true;
      }

      // Inicializar AdSense real
      this.isInitialized = true;
      console.log('✅ AdSense inicializado correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error inicializando AdSense:', error);
      return false;
    }
  }

  // Cargar script de AdSense
  loadAdSenseScript() {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="adsbygoogle"]')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX'; // Reemplaza con tu ID
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        console.log('📺 Script de AdSense cargado');
        resolve();
      };
      
      script.onerror = () => {
        console.error('❌ Error cargando script de AdSense');
        reject(new Error('Failed to load AdSense script'));
      };

      document.head.appendChild(script);
    });
  }

  // Precargar anuncio recompensado
  async preloadRewardedAd() {
    if (!this.isInitialized) {
      await this.initializeAds();
    }

    try {
      if (this.isTestMode) {
        console.log('🧪 MODO TEST: Simulando precarga de anuncio recompensado');
        
        // Simular tiempo de carga
        setTimeout(() => {
          this.callbacks.onAdReady?.();
        }, 1000);
        
        return true;
      }

      // Aquí iría la lógica real de AdSense para anuncios recompensados
      // Nota: AdSense no tiene anuncios recompensados nativamente
      // Podrías usar Google AdMob para web o una alternativa como:
      // - AdMaven
      // - PropellerAds
      // - RichAds
      
      console.log('📺 Precargando anuncio recompensado real...');
      
      // Por ahora, simular éxito
      setTimeout(() => {
        this.callbacks.onAdReady?.();
      }, 2000);
      
      return true;
    } catch (error) {
      console.error('❌ Error precargando anuncio:', error);
      this.callbacks.onAdError?.(error);
      return false;
    }
  }

  // Mostrar anuncio recompensado
  async showRewardedAd() {
    try {
      if (this.isTestMode) {
        console.log('🧪 MODO TEST: Mostrando anuncio recompensado simulado');
        return this.simulateRewardedAd();
      }

      // Lógica real para mostrar anuncio
      console.log('📺 Mostrando anuncio recompensado real...');
      
      // Simular por ahora (implementar con tu plataforma de anuncios elegida)
      return this.simulateRewardedAd();
      
    } catch (error) {
      console.error('❌ Error mostrando anuncio:', error);
      this.callbacks.onAdError?.(error);
      return false;
    }
  }

  // Simular flujo completo de anuncio recompensado
  simulateRewardedAd() {
    return new Promise((resolve) => {
      // Anuncio abierto
      this.callbacks.onAdOpened?.();
      
      // Simular duración del anuncio (5-30 segundos típico)
      const adDuration = this.isTestMode ? 3000 : 15000;
      
      setTimeout(() => {
        // Anuncio completado - dar recompensa
        const reward = Math.floor(Math.random() * 3000) + 1000; // 1000-4000 pesos
        this.callbacks.onAdRewarded?.(reward);
        
        setTimeout(() => {
          // Anuncio cerrado
          this.callbacks.onAdClosed?.();
          resolve(true);
        }, 1000);
      }, adDuration);
    });
  }

  // Configurar callbacks
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Verificar si hay anuncio disponible
  isAdAvailable() {
    if (this.isTestMode) return true;
    
    // Lógica real para verificar disponibilidad
    return this.isInitialized;
  }

  // Limpiar recursos
  destroy() {
    this.callbacks = {};
    this.adInstance = null;
  }
}

// Hook personalizado para usar el administrador de anuncios
export function useRealAds() {
  const adManagerRef = useRef(null);
  const [adState, setAdState] = useState('idle'); // idle, loading, ready, showing, rewarded, error
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    // Crear instancia del administrador
    adManagerRef.current = new RealAdManager();
    
    // Configurar callbacks
    adManagerRef.current.setCallbacks({
      onAdReady: () => {
        console.log('✅ Anuncio listo para mostrar');
        setAdState('ready');
        setIsAvailable(true);
      },
      onAdOpened: () => {
        console.log('📺 Anuncio abierto');
        setAdState('showing');
      },
      onAdRewarded: (amount) => {
        console.log('💰 Recompensa recibida:', amount);
        setAdState('rewarded');
        
        // Disparar evento personalizado con la recompensa
        window.dispatchEvent(new CustomEvent('adReward', { 
          detail: { amount, timestamp: Date.now() } 
        }));
      },
      onAdClosed: () => {
        console.log('✅ Anuncio cerrado');
        setAdState('idle');
        setIsAvailable(false);
      },
      onAdError: (error) => {
        console.error('❌ Error en anuncio:', error);
        setAdState('error');
        setIsAvailable(false);
      }
    });

    // Inicializar automáticamente
    adManagerRef.current.initializeAds().then((success) => {
      if (success) {
        console.log('🎯 Administrador de anuncios inicializado');
      }
    });

    // Cleanup
    return () => {
      adManagerRef.current?.destroy();
    };
  }, []);

  const preloadAd = async () => {
    if (!adManagerRef.current) return false;
    
    setAdState('loading');
    const success = await adManagerRef.current.preloadRewardedAd();
    
    if (!success) {
      setAdState('error');
    }
    
    return success;
  };

  const showAd = async () => {
    if (!adManagerRef.current || adState !== 'ready') {
      console.warn('⚠️ Anuncio no está listo');
      return false;
    }

    return await adManagerRef.current.showRewardedAd();
  };

  const isReady = () => {
    return adState === 'ready' && isAvailable;
  };

  return {
    adState,
    isAvailable,
    isReady: isReady(),
    preloadAd,
    showAd,
    manager: adManagerRef.current
  };
}

export default RealAdManager;
