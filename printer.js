const express = require('express');
const router = express.Router();
const { authenticateToken, requireCashierOrAdmin, requireAdmin } = require('../middleware/auth');
const {
  getPrinterStatus,
  reconnectPrinter,
  printOrderTicket,
  printCashCutReport,
  testPrint,
  printCustomTicket,
  printCustomCashCut
} = require('../controllers/printerController');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener estado de la impresora (cajero y admin)
router.get('/status', requireCashierOrAdmin, getPrinterStatus);

// Reconectar impresora (solo admin)
router.post('/reconnect', requireAdmin, reconnectPrinter);

// Test de impresión (solo admin)
router.post('/test', requireAdmin, testPrint);

// Imprimir ticket de orden específica (cajero y admin)
router.post('/ticket/order/:orderId', requireCashierOrAdmin, printOrderTicket);

// Imprimir corte de caja específico (solo admin)
router.post('/ticket/cash-cut/:cutId', requireAdmin, printCashCutReport);

// Imprimir ticket personalizado (cajero y admin)
router.post('/ticket/custom', requireCashierOrAdmin, printCustomTicket);

// Imprimir corte de caja personalizado (solo admin)
router.post('/cash-cut/custom', requireAdmin, printCustomCashCut);

module.exports = router;
