const express = require('express');
const router = express.Router();
const { authenticateToken, requireCashierOrAdmin } = require('../middleware/auth');
const {
  getActiveOrders,
  searchOrdersByPhone,
  getOrderById,
  createOrder,
  deleteOrder,
  getCashReportData,
  closeOrdersByCashier
} = require('../controllers/orderController');

// Todas las rutas requieren autenticación
router.use(authenticateToken);
router.use(requireCashierOrAdmin);

// Obtener órdenes activas
router.get('/', getActiveOrders);

// Buscar órdenes por teléfono
router.get('/search/phone/:phone', searchOrdersByPhone);

// Obtener estadísticas para corte de caja
router.get('/reports/cash', getCashReportData);

// Obtener orden por ID
router.get('/:id', getOrderById);

// Crear nueva orden
router.post('/', createOrder);

// Eliminar orden
router.delete('/:id', deleteOrder);

// Cerrar órdenes por cajero
router.post('/close', closeOrdersByCashier);

module.exports = router;
