const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener todos los usuarios (solo admin)
router.get('/', requireAdmin, getUsers);

// Obtener usuario por ID (solo admin)
router.get('/:id', requireAdmin, getUserById);

// Crear nuevo usuario (solo admin)
router.post('/', requireAdmin, createUser);

// Actualizar usuario (solo admin)
router.put('/:id', requireAdmin, updateUser);

// Eliminar usuario (solo admin)
router.delete('/:id', requireAdmin, deleteUser);

module.exports = router;
