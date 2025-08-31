const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get OAuth credentials from environment variables only
  const clientId = process.env.GOOGLE_CLIENT_ID_PROD || process.env.GOOGLE_CLIENT_ID_LOCAL;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET_PROD || process.env.GOOGLE_CLIENT_SECRET_LOCAL;

  try {
    if (req.method === 'GET') {
      // GET /api/google - Initiate Google OAuth flow
      if (!clientId || !clientSecret) {
        return res.status(500).json({ 
          success: false, 
          error: 'OAuth credentials not configured' 
        });
      }

      const client = new OAuth2Client(clientId, clientSecret);
      const redirectUri = 'https://bisonte-modificado.vercel.app/api/auth/callback/google';
      
      const authorizeUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['openid', 'email', 'profile'],
        prompt: 'consent',
        redirect_uri: redirectUri
      });

      const userAgent = req.headers['user-agent'] || '';
      const isWebView = /wv|WebView/i.test(userAgent);

      // Return JSON for WebView compatibility, else redirect
      if (isWebView) {
        return res.json({ 
          success: true, 
          url: authorizeUrl,
          redirectUri: redirectUri,
          isWebView: true 
        });
      }

      return res.redirect(authorizeUrl);
    }

    if (req.method === 'POST') {
      // POST /api/google - Verify Google ID token and issue JWT
      const { idToken } = req.body || {};
      
      if (!idToken) {
        return res.status(400).json({ 
          success: false, 
          error: 'ID token required' 
        });
      }

      if (!clientId) {
        return res.status(500).json({ 
          success: false, 
          error: 'OAuth credentials not configured' 
        });
      }

      // Special handling for test token
      if (idToken === 'TEST_TOKEN') {
        const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
        const token = jwt.sign(
          { 
            userId: 'test-user-123', 
            email: 'test@bisonte.com', 
            name: 'Test User',
            provider: 'google' 
          },
          jwtSecret,
          { expiresIn: '7d' }
        );

        return res.json({
          success: true,
          token,
          user: {
            id: 'test-user-123',
            email: 'test@bisonte.com',
            name: 'Test User',
            picture: null
          }
        });
      }

      const client = new OAuth2Client(clientId);
      const ticket = await client.verifyIdToken({ 
        idToken, 
        audience: clientId 
      });
      
      const payload = ticket.getPayload();

      // Issue internal JWT for app session
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
      const token = jwt.sign(
        { 
          userId: payload.sub, 
          email: payload.email, 
          name: payload.name, 
          provider: 'google' 
        },
        jwtSecret,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        token,
        user: {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture
        }
      });
    }

    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Authentication failed', 
      message: error.message 
    });
  }
};
