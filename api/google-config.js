// Endpoint directo para Google OAuth config
export default function handler(req, res) {
  console.log('Google Config API - Direct call:', req.method, req.url);
  
  // Headers CORS obligatorios
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'public, max-age=300');
  
  // Manejar preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are allowed',
      method: req.method
    });
  }

  try {
    const origin = req.headers.origin || req.headers.referer || '';
    const isDevelopment = origin.includes('localhost') || 
                         origin.includes('127.0.0.1') || 
                         origin.includes('3000') ||
                         origin.includes('3001');
    
    const clientIds = {
      development: process.env.GOOGLE_CLIENT_ID_LOCAL || "831420252741-4191330gjs69hkm4jr55rig3d8ouas0f.apps.googleusercontent.com",
      production: process.env.GOOGLE_CLIENT_ID_PROD || "108242889910-n3ptem16orktkl0klv8onlttfl83r1ul.apps.googleusercontent.com"
    };
    
    const googleClientId = isDevelopment ? clientIds.development : clientIds.production;
    const redirectUri = isDevelopment ? 
      origin + '/auth/google/callback' : 
      'https://www.bisonteapp.com/auth/google/callback';
    
    const response = {
      googleClientId,
      redirectUri,
      environment: isDevelopment ? 'development' : 'production',
      origin: origin || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      version: '1.0.1'
    };
    
    console.log('Google Config success:', {
      environment: response.environment,
      clientIdPrefix: googleClientId.substring(0, 12) + '...'
    });
    
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Google Config API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      success: false,
      timestamp: new Date().toISOString()
    });
  }
}
