// API para configuración de Google OAuth
// Archivo: api/public/config.js

export default function handler(req, res) {
  // Solo permitir método GET
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are allowed'
    });
  }

  try {
    // Obtener el origen de la petición para determinar el entorno
    const origin = req.headers.origin || req.headers.referer || '';
    const userAgent = req.headers['user-agent'] || '';
    
    // Log para debugging
    console.log('Config API called:', {
      origin,
      userAgent: userAgent.substring(0, 50) + '...',
      method: req.method
    });
    
    // Detectar si es desarrollo basado en el origen
    const isDevelopment = origin.includes('localhost') || 
                         origin.includes('127.0.0.1') || 
                         origin.includes('3000') ||
                         origin.includes('3001');
    
    // Client IDs por entorno (desde variables de entorno de Vercel)
    const clientIds = {
      development: process.env.GOOGLE_CLIENT_ID_LOCAL || "831420252741-4191330gjs69hkm4jr55rig3d8ouas0f.apps.googleusercontent.com",
      production: process.env.GOOGLE_CLIENT_ID_PROD || "108242889910-n3ptem16orktkl0klv8onlttfl83r1ul.apps.googleusercontent.com"
    };
    
    // Seleccionar Client ID basado en entorno
    const googleClientId = isDevelopment ? clientIds.development : clientIds.production;
    
    // Determinar redirect URI basado en origen
    let redirectUri;
    if (isDevelopment) {
      redirectUri = origin + '/auth/google/callback';
    } else {
      redirectUri = 'https://www.bisonteapp.com/auth/google/callback';
    }
    
    // Headers CORS para permitir acceso desde el frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cache-Control', 'public, max-age=300'); // Cache por 5 minutos
    
    // Respuesta con configuración
    const response = {
      googleClientId,
      redirectUri,
      environment: isDevelopment ? 'development' : 'production',
      origin: origin || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      version: '1.0.0'
    };
    
    console.log('Config API response:', {
      environment: response.environment,
      clientIdPrefix: googleClientId.substring(0, 10) + '...',
      redirectUri
    });
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('Error en API config:', error);
    
    // Headers CORS incluso en error
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      success: false,
      timestamp: new Date().toISOString()
    });
  }
}

// Manejar preflight requests (OPTIONS)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}
