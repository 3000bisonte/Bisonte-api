// =================== SEPARACIÓN DE APIs DEL BUILD ESTÁTICO ===================
// Configuración de URLs de API para diferentes entornos

export const API_CONFIG = {
  // URLs base para diferentes entornos
  development: {
  frontend: 'http://localhost:3000',  // Frontend Next.js
  // Usar backend de producción durante desarrollo para evitar conflictos de puertos
  backend: 'https://bisonte-api.vercel.app'
  },
  production: {
    frontend: 'https://tu-frontend.vercel.app',    // Frontend estático
  backend: 'https://bisonte-api.vercel.app' // ✅ API backend en producción (actualizado)
  },
  
  // Detectar entorno y retornar URL de API correcta
  getApiBaseURL: () => {
    // En APK (Capacitor) - siempre usar API de producción
    if (typeof window !== 'undefined' && window.Capacitor) {
      return 'https://bisonte-api.vercel.app';
    }
    
    // En desarrollo local: apuntar al backend de producción para evitar choques con Next dev
    if (typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1')) {
      return 'https://bisonte-api.vercel.app';
    }
    
    // En producción web
    return 'https://bisonte-api.vercel.app';
  },

  // Detectar URL del frontend actual
  getFrontendBaseURL: () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'http://localhost:3000';
  },
  
  // Endpoints de API - NOTA: Estos serán servidos por el backend separado
  endpoints: {
    // Autenticación
    auth: {
      login: '/api/auth/login',
      register: '/api/register', 
      google: '/api/auth/google',
      logout: '/api/auth/logout'
    },
    // Usuarios
    users: {
      list: '/api/usuarios',
      profile: '/api/perfil',
      exists: '/api/perfil/existeusuario'
    },
    // Envíos
    shipments: {
      create: '/api/guardarenvio',
      list: '/api/envios',
      history: '/api/envios/historial',
      updateStatus: '/api/envios/actualizar-estado',
      notify: '/api/notificar-envio',
      get: '/api/obtenerenvios'
    },
    // Contactos
    contacts: {
      create: '/api/contacto',
      list: '/api/contacto',
      get: '/api/contacto',
      update: '/api/contacto',
      delete: '/api/contacto'
    },
    // Emails
    email: {
      send: '/api/email',
      contact: '/api/send'
    },
    // Pagos
    payments: {
      mercadopago: '/api/mercadopago'
    },
    // Perfiles
    profile: {
      remitente: '/api/remitente',
      destinatario: '/api/destinatario'
    },
    // Recuperación de contraseña
    recovery: {
      request: '/api/recuperar',
      validate: '/api/recuperar/validar-token'
    },
    // Estadísticas admin
    admin: {
      stats: '/api/admin/stats'
    },
    // Health check
    health: '/api/health',
    test: '/api/test'
  },

  // Función helper para construir URL completa
  buildApiUrl: (endpoint) => {
    const baseUrl = API_CONFIG.getApiBaseURL();
    return `${baseUrl}${endpoint}`;
  },

  // Función helper para detectar si está en modo APK
  isCapacitorApp: () => {
    return typeof window !== 'undefined' && window.Capacitor;
  },

  // Función helper para detectar entorno
  getEnvironment: () => {
    if (typeof window === 'undefined') return 'server';
    if (API_CONFIG.isCapacitorApp()) return 'capacitor';
    if (window.location.hostname === 'localhost') return 'development';
    return 'production';
  }
};

// =================== FUNCIONES HELPER PARA REQUESTS ===================

// Helper function para hacer requests con la URL correcta del API
export const apiRequest = async (endpoint, options = {}) => {
  const apiBaseURL = API_CONFIG.getApiBaseURL();
  const fullUrl = `${apiBaseURL}${endpoint}`;
  
  console.log(`🔗 API Request: ${options.method || 'GET'} ${fullUrl}`);
  console.log(`🌍 Environment: ${API_CONFIG.getEnvironment()}`);
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(fullUrl, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`❌ API Error (${fullUrl}):`, error);
    throw error;
  }
};

// Backward compatibility - función original
export const apiRequestLegacy = async (endpoint, options = {}) => {
  const baseURL = API_CONFIG.getFrontendBaseURL();
  const url = `${baseURL}${endpoint}`;
  
  console.log(`🌐 API Request: ${url}`);
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };
  
  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`❌ API Error for ${url}:`, error);
    throw error;
  }
};

// Export para usar en componentes
export default API_CONFIG;
