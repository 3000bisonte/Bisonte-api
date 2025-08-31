const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      // Generate auth URL
      const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['profile', 'email'],
        prompt: 'consent'
      });
      
      return res.json({ authUrl, redirectUri: process.env.GOOGLE_REDIRECT_URI || '/api/auth/callback/google' });
    }
    
    if (req.method === 'POST') {
      const { idToken, accessToken } = req.body || {};
      
      if (!idToken && !accessToken) {
        return res.status(400).json({ error: 'ID token or access token required' });
      }
      
      const ticket = await client.verifyIdToken({
        idToken: idToken || accessToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      const userId = payload.sub;
      const email = payload.email;
      const name = payload.name;
      
      const jwtToken = jwt.sign(
        { userId, email, name, role: 'user' },
        process.env.JWT_SECRET || 'fallback-secret-key',
        { expiresIn: '24h' }
      );
      
      return res.json({
        success: true,
        token: jwtToken,
        user: { id: userId, email, name, role: 'user' }
      });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed', 
      details: error.message 
    });
  }
};
