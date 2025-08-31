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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

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
};
