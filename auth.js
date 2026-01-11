const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { login, verifyToken } = require('../controllers/authController');

// Ruta de login
router.post('/login', login);

// Ruta para verificar token
router.get('/verify', authenticateToken, verifyToken);

module.exports = router;
