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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { pathname } = new URL(req.url, 'http://localhost');
  
  // Route handlers
  if (pathname === '/api/contacto' && req.method === 'POST') {
    const { nombre, email, mensaje } = req.body || {};
    if (!nombre || !email || !mensaje) {
      return res.status(400).json({ error: 'All fields required' });
    }
    return res.json({ success: true, message: 'Contact form submitted', id: Date.now() });
  }
  
  if (pathname === '/api/email' && req.method === 'POST') {
    const { to, subject, body } = req.body || {};
    if (!to || !subject) {
      return res.status(400).json({ error: 'To and subject required' });
    }
    return res.json({ success: true, message: 'Email sent', messageId: 'email_' + Date.now() });
  }
  
  if (pathname === '/api/envios' && req.method === 'GET') {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ error: 'Token required' });
    
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: 'Invalid token' });
    
    return res.json([
      { id: 1, origen: 'Mexico DF', destino: 'Guadalajara', estado: 'en_transito', fecha: '2024-01-15' },
      { id: 2, origen: 'Monterrey', destino: 'Tijuana', estado: 'entregado', fecha: '2024-01-14' }
    ]);
  }
  
  if (pathname === '/api/envios' && req.method === 'POST') {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ error: 'Token required' });
    
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: 'Invalid token' });
    
    const { origen, destino, peso } = req.body || {};
    if (!origen || !destino) {
      return res.status(400).json({ error: 'Origin and destination required' });
    }
    
    return res.json({ 
      success: true, 
      envio: { id: Date.now(), origen, destino, peso, estado: 'pendiente' } 
    });
  }
  
  return res.status(404).json({ error: 'Business endpoint not found' });
};
