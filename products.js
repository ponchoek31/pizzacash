const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin, requireCashierOrAdmin } = require('../middleware/auth');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener todos los productos (cajero y admin)
router.get('/', requireCashierOrAdmin, getProducts);

// Obtener producto por ID (cajero y admin)
router.get('/:id', requireCashierOrAdmin, getProductById);

// Crear nuevo producto (solo admin)
router.post('/', requireAdmin, createProduct);

// Actualizar producto (solo admin)
router.put('/:id', requireAdmin, updateProduct);

// Eliminar producto (solo admin)
router.delete('/:id', requireAdmin, deleteProduct);

module.exports = router;
