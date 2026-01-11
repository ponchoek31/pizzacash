const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  getCashCuts,
  getCashCutById,
  createCashCut,
  getCashCutStats
} = require('../controllers/cashCutController');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener todos los cortes de caja (solo admin)
router.get('/', requireAdmin, getCashCuts);

// Obtener estadísticas de cortes (solo admin)
router.get('/stats', requireAdmin, getCashCutStats);

// Obtener corte por ID (solo admin)
router.get('/:id', requireAdmin, getCashCutById);

// Crear nuevo corte de caja (solo admin)
router.post('/', requireAdmin, createCashCut);

module.exports = router;
