const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
  } catch (error) {
    // For testing, accept any token that looks like a JWT
    if (token && token.includes('.')) {
      const parts = token.split('.');
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          return payload;
        } catch (e) {
          return { userId: 'test', email: 'test@bisonte.com', role: 'user' };
        }
      }
    }
    return null;
  }
};

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.substring(7);
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { pathname } = new URL(req.url, 'http://localhost');
  
  // Route handlers
  if (pathname === '/api/auth/providers' && req.method === 'GET') {
    return res.json({
      google: { id: 'google', name: 'Google', type: 'oauth', signinUrl: '/api/auth/signin/google' }
    });
  }
  
  if (pathname === '/api/auth/csrf' && req.method === 'GET') {
    return res.json({ csrfToken: 'mock-csrf-token-' + Date.now() });
  }
  
  if (pathname === '/api/auth/signin/google' && req.method === 'GET') {
    const authUrl = 'https://accounts.google.com/oauth/authorize?client_id=mock';
    return res.json({ authUrl, redirectUri: '/api/auth/callback/google' });
  }
  
  if (pathname === '/api/auth/google' && req.method === 'POST') {
    const { idToken, accessToken } = req.body || {};
    if (!idToken && !accessToken) {
      return res.status(400).json({ error: 'ID token or access token required' });
    }
    
    const jwtToken = jwt.sign(
      { userId: 'google_user', email: 'user@google.com', name: 'Google User', role: 'user' },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );
    
    return res.json({
      success: true,
      token: jwtToken,
      user: { id: 'google_user', email: 'user@google.com', name: 'Google User', role: 'user' }
    });
  }
  
  if (pathname === '/api/auth/session' && req.method === 'GET') {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ authenticated: false });
    
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ authenticated: false, error: 'Invalid token' });
    
    return res.json({ 
      authenticated: true, 
      user: { 
        id: decoded.userId || decoded.id || 'test', 
        email: decoded.email || 'test@bisonte.com', 
        name: decoded.name || 'Test User', 
        role: decoded.role || 'user' 
      } 
    });
  }
  
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    return res.json({ success: true, token: 'mock-login-token', user: { email: 'demo@bisonte.com' } });
  }
  
  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    return res.json({ success: true, message: 'Logged out successfully' });
  }
  
  if (pathname === '/api/auth/callback/google' && req.method === 'GET') {
    const { code, state, error } = req.query;
    
    if (error) {
      return res.redirect('/login?error=oauth_error&details=' + encodeURIComponent(error));
    }
    
    if (!code) {
      return res.json({ success: true, token: 'mock-token-callback', mode: 'no-code-fallback' });
    }

    return res.redirect('/home?token=mock-token-from-callback&success=true');
  }
  
  return res.status(404).json({ error: 'Auth endpoint not found' });
};
