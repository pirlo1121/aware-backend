const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, logout, getProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { validateRegister, validateLogin, handleValidationErrors } = require('../middlewares/validateMiddleware');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Demasiados intentos de inicio de sesión. Intente de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', loginLimiter, validateLogin, handleValidationErrors, login);
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);

module.exports = router;
