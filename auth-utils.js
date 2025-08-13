const jwt = require('jsonwebtoken');

// Lista de emails de administradores
const ADMIN_EMAILS = [
  '3000bisonte@gmail.com',
  'bisonteangela@gmail.com', 
  'bisonteoskar@gmail.com'
];

function getSecret() {
  return process.env.JWT_SECRET || 'dev-insecure-secret-change-me';
}

function getUserRole(email) {
  return ADMIN_EMAILS.includes(email?.toLowerCase()) ? 'admin' : 'user';
}

function signToken(user, opts = {}) {
  const userEmail = user.email?.toLowerCase();
  const role = getUserRole(userEmail);
  
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name || user.nombre || '',
    provider: user.provider || 'credentials',
    role: role
  };
  const expiresIn = opts.expiresIn || '7d';
  const token = jwt.sign(payload, getSecret(), { expiresIn });
  return { token, expiresIn, role };
}

function verifyToken(token) {
  try {
    return jwt.verify(token, getSecret());
  } catch(_e) {
    return null;
  }
}

function authMiddleware(req, _res, next) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (auth && auth.startsWith('Bearer ')) {
    const raw = auth.slice(7).trim();
    const decoded = verifyToken(raw);
    if (decoded) {
      req.user = decoded;
    }
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success:false, error:'No autorizado' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success:false, error:'No autorizado' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Acceso denegado - Se requieren permisos de administrador' 
    });
  }
  next();
}

module.exports = {
  signToken,
  verifyToken,
  authMiddleware,
  requireAuth,
  requireAdmin,
  getUserRole,
  ADMIN_EMAILS
};
