const crypto = require('crypto');

const setCsrfCookie = (res) => {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie('csrf-token', token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  return token;
};

const csrfProtection = (req, res, next) => {
  if (!req.cookies['csrf-token']) {
    setCsrfCookie(res);
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const cookieToken = req.cookies['csrf-token'];
    const headerToken = req.headers['x-csrf-token'];

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return res.status(403).json({
        success: false,
        error: 'CSRF token inválido',
      });
    }
  }

  next();
};

module.exports = { csrfProtection, setCsrfCookie };
