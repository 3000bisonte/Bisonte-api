const jwt = require('jsonwebtoken');

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

const requireAdmin = (decoded) => {
  return decoded && (decoded.role === 'admin' || decoded.role === 'super_admin');
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { pathname } = new URL(req.url, 'http://localhost');
  const token = getBearerToken(req);
  
  if (!token) return res.status(401).json({ error: 'Token required' });
  
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Invalid token' });
  
  if (!requireAdmin(decoded)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  // Route handlers
  if (pathname === '/api/admin/users' && req.method === 'GET') {
    return res.json([
      { id: 1, name: 'Admin User', email: 'admin@bisonte.com', role: 'admin', status: 'active' },
      { id: 2, name: 'Test User', email: 'test@bisonte.com', role: 'user', status: 'active' },
      { id: 3, name: 'Demo User', email: 'demo@bisonte.com', role: 'user', status: 'inactive' }
    ]);
  }
  
  if (pathname === '/api/admin/stats' && req.method === 'GET') {
    return res.json({
      totalUsers: 150,
      activeUsers: 120,
      totalEnvios: 1250,
      pendingEnvios: 45,
      completedEnvios: 1205
    });
  }
  
  if (pathname === '/api/admin/config' && req.method === 'GET') {
    return res.json({
      appName: 'Bisonte Logística',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      features: ['google_auth', 'jwt_tokens', 'user_roles']
    });
  }
  
  if (pathname === '/api/admin/roles' && req.method === 'GET') {
    return res.json([
      { id: 'admin', name: 'Administrator', permissions: ['read', 'write', 'delete', 'admin'] },
      { id: 'user', name: 'User', permissions: ['read', 'write'] },
      { id: 'guest', name: 'Guest', permissions: ['read'] }
    ]);
  }
  
  return res.status(404).json({ error: 'Admin endpoint not found' });
};
