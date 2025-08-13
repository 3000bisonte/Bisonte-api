const jwt = require('jsonwebtoken');

function getSecret() {
  return process.env.JWT_SECRET || 'dev-insecure-secret-change-me';
}

function signToken(user, opts = {}) {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name || user.nombre || '',
    provider: user.provider || 'credentials'
  };
  const expiresIn = opts.expiresIn || '7d';
  const token = jwt.sign(payload, getSecret(), { expiresIn });
  return { token, expiresIn };
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

module.exports = {
  signToken,
  verifyToken,
  authMiddleware,
  requireAuth
};
