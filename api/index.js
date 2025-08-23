export default function handler(req, res) {
  console.log('Root API called:', req.method, req.url);
  
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.url === '/config' || req.url === '/public/config' || req.url === '/api/config' || req.url === '/api/public/config') {
    try {
      // Obtener el origen de la petición para determinar el entorno
      const origin = req.headers.origin || req.headers.referer || '';
      
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
      
      // Cache headers
      res.setHeader('Cache-Control', 'public, max-age=300');
      
      // Respuesta con configuración
      const response = {
        googleClientId,
        redirectUri,
        environment: isDevelopment ? 'development' : 'production',
        origin: origin || 'unknown',
        timestamp: new Date().toISOString(),
        success: true,
        version: '1.0.0',
        requestUrl: req.url
      };
      
      console.log('Google Config API response:', {
        environment: response.environment,
        clientIdPrefix: googleClientId.substring(0, 10) + '...',
        redirectUri,
        requestUrl: req.url
      });
      
      return res.status(200).json(response);
      
    } catch (error) {
      console.error('Error en API config:', error);
      
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        success: false,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Para cualquier otra ruta
  res.status(200).json({
    message: 'Bisonte API - Google OAuth Configuration',
    available_endpoints: [
      '/api/config',
      '/api/public/config'
    ],
    timestamp: new Date().toISOString(),
    requestUrl: req.url,
    method: req.method
  });
}
