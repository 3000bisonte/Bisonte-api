const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
  } catch (error) {
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
  
  if (pathname === '/api/auth/session' && req.method === 'GET') {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ authenticated: false });
    
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ authenticated: false, error: 'Invalid token' });
    
    return res.json({ 
      authenticated: true, 
      user: { 
        id: decoded.userId, 
        email: decoded.email, 
        name: decoded.name, 
        role: decoded.role 
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
