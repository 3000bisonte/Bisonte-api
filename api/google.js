const { OAuth2Client } = require('google-auth-library');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const clientId = process.env.GOOGLE_CLIENT_ID_PROD || process.env.GOOGLE_CLIENT_ID_LOCAL;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET_PROD || process.env.GOOGLE_CLIENT_SECRET_LOCAL;
      
      if (!clientId || !clientSecret) {
        return res.status(500).json({ error: 'OAuth credentials not configured' });
      }

      const client = new OAuth2Client(clientId, clientSecret);
      const redirectUri = 'https://bisonte-modificado.vercel.app/api/auth/callback/google';

      const authorizeUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['openid', 'email', 'profile'],
        prompt: 'consent',
        redirect_uri: redirectUri
      });

      // Para WebView
      if (req.headers['user-agent'] && /wv|WebView/i.test(req.headers['user-agent'])) {
        return res.json({
          success: true,
          authUrl: authorizeUrl,
          isWebView: true
        });
      } else {
        return res.redirect(authorizeUrl);
      }
    }

    if (req.method === 'POST') {
      const { idToken } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ error: 'ID token required' });
      }

      const clientId = process.env.GOOGLE_CLIENT_ID_PROD || process.env.GOOGLE_CLIENT_ID_LOCAL;
      const client = new OAuth2Client(clientId);
      
      const ticket = await client.verifyIdToken({
        idToken,
        audience: clientId
      });

      const payload = ticket.getPayload();
      
      return res.json({
        success: true,
        user: {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture
        }
      });
    }

    res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed', message: error.message });
  }
};
