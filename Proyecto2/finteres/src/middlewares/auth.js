const jwt = require('jsonwebtoken');
const passport = require('passport');

// Middleware para APIs (JWT)
module.exports.jwtAuth = (req, res, next) => {
  const token = req.cookies?.authToken || 
               req.headers.authorization?.split(' ')[1] || 
               req.query.token;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.clearCookie('authToken');
      return res.status(401).json({ error: err.name });
    }

    if (!decoded.userId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    req.auth = { userId: decoded.userId };
    next();
  });
};

// Middleware para vistas (Session + Passport)
module.exports.isAuthenticated = (req, res, next) => {
  // 1. Primero verifica sesión de Passport
  if (req.isAuthenticated()) return next();

  // 2. Si no hay sesión, verifica token JWT (para compatibilidad)
  const token = req.cookies?.authToken;
  if (!token) {
    console.warn('Acceso no autorizado - Redirigiendo a login');
    return res.redirect(`${process.env.NOTES_APP_URL}/login`);
  }

  // 3. Verificación JWT de emergencia
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err || !decoded.userId) {
      res.clearCookie('authToken');
      return res.redirect(`${process.env.NOTES_APP_URL}/login?error=session_expired`);
    }

    // 4. Crea sesión temporal si el token es válido
    req.login({ _id: decoded.userId }, (loginErr) => {
      if (loginErr) return next(loginErr);
      return next();
    });
  });
};

// Middleware para roles (extensión)
module.exports.checkRole = (role) => {
  return (req, res, next) => {
    if (!req.user?.roles?.includes(role)) {
      return res.status(403).redirect('/');
    }
    next();
  };
};