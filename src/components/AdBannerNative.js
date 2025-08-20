"use client";
import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

export default function AdBannerNative() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let removed;
    (async () => {
      if (!Capacitor?.isNativePlatform?.()) return; // solo en nativo
      try {
        const { AdMob, BannerAdPosition, BannerAdSize, BannerAdPluginEvents } = await import('@capacitor-community/admob');
        // Inicializar el SDK antes de usar el banner
        try { await AdMob.initialize(); } catch {}
        if (!process.env.NEXT_PUBLIC_ADMOB_BANNER_ID) {
          console.warn('AdMob Banner ID no configurado');
          return;
        }
        AdMob.addListener(BannerAdPluginEvents.Loaded, () => setReady(true));
        await AdMob.showBanner({
          adId: process.env.NEXT_PUBLIC_ADMOB_BANNER_ID,
          adSize: BannerAdSize.BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
        });
        removed = () => AdMob.removeBanner();
      } catch (e) {
        console.warn('Banner AdMob no disponible:', e);
      }
    })();
    return () => { try { removed && removed(); } catch {}
    };
  }, []);

  return null;
}
