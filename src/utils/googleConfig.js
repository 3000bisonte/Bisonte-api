// Utilidad para obtener el Client ID correcto según el entorno
export const getGoogleClientId = () => {
  if (typeof window === 'undefined') {
    // Server-side: usar variable de entorno
    return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "108242889910-n3ptem16orktkl0klv8onlttfl83r1ul.apps.googleusercontent.com";
  }
  
  // Client-side: determinar según el hostname
  const isProduction = 
    window.location.hostname === 'www.bisonteapp.com' ||
    window.location.hostname === 'bisonteapp.com' ||
    window.location.hostname.includes('vercel.app');
  
  if (isProduction) {
    return "108242889910-n3ptem16orktkl0klv8onlttfl83r1ul.apps.googleusercontent.com";
  } else {
    return "831420252741-4191330gjs69hkm4jr55rig3d8ouas0f.apps.googleusercontent.com";
  }
};

export const isProductionEnvironment = () => {
  if (typeof window === 'undefined') {
    return process.env.NODE_ENV === 'production';
  }
  
  return window.location.hostname === 'www.bisonteapp.com' ||
         window.location.hostname === 'bisonteapp.com' ||
         window.location.hostname.includes('vercel.app');
};
