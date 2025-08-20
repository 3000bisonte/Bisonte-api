"use client";
import { useEffect, useRef } from 'react';

export default function AdBanner({ 
  adSlot = "1234567890", // Tu slot de AdSense
  adClient = "ca-pub-XXXXXXXXXX", // Tu ID de AdSense
  style = { display: 'block', width: '100%', height: '90px' },
  format = "auto",
  responsive = true,
  className = "adsbygoogle"
}) {
  const adRef = useRef(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    // Solo cargar el anuncio una vez
    if (isLoaded.current) return;

    try {
      // Verificar si estamos en el navegador
      if (typeof window !== 'undefined') {
        // Inicializar AdSense
        if (window.adsbygoogle && adRef.current) {
          window.adsbygoogle.push({});
          isLoaded.current = true;
          console.log('📺 Banner de anuncio inicializado');
        }
      }
    } catch (error) {
      console.error('❌ Error cargando banner de anuncio:', error);
    }
  }, []);

  // En modo desarrollo, mostrar un placeholder
  if (process.env.NODE_ENV === 'development') {
    return (
      <div 
        className={`${className} bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-dashed border-purple-300 rounded-lg flex items-center justify-center text-purple-600 font-medium`}
        style={style}
      >
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.55-2.27A1 1 0 0121 8.66v6.68a1 1 0 01-1.45.89L15 14M5 8h8a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2z" />
          </svg>
          <p className="text-sm">🧪 Banner de Anuncio (Modo Dev)</p>
        </div>
      </div>
    );
  }

  return (
    <ins
      ref={adRef}
      className={className}
      style={style}
      data-ad-client={adClient}
      data-ad-slot={adSlot}
      data-ad-format={format}
      data-full-width-responsive={responsive.toString()}
    />
  );
}

// Componente específico para anuncios responsive
export function ResponsiveAdBanner({ adSlot, className = "" }) {
  return (
    <AdBanner
      adSlot={adSlot}
      style={{ display: 'block', width: '100%', minHeight: '90px' }}
      className="ad-banner-mobile"
      format="auto"
      responsive={true}
      className={`adsbygoogle ${className}`}
    />
  );
}

// Componente para anuncios rectangulares
export function RectangleAdBanner({ adSlot, className = "" }) {
  return (
    <AdBanner
      adSlot={adSlot}
      style={{ display: 'inline-block', width: '336px', height: '280px' }}
      className="ad-banner-rectangle"
      className={`adsbygoogle ${className}`}
    />
  );
}

// Componente para anuncios móviles
export function MobileAdBanner({ adSlot, className = "" }) {
  return (
    <AdBanner
      adSlot={adSlot}
      style={{ display: 'block', width: '100%', height: '100px' }}
      className="ad-banner-leaderboard"
      format="auto"
      responsive={true}
      className={`adsbygoogle ${className}`}
    />
  );
}
