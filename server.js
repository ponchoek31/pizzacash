const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar configuración de base de datos
const { checkConnection } = require('./config/database');

// Importar servicio de impresora
const { getThermalPrinterService } = require('./services/ThermalPrinterService');

// Importar rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const cashCutRoutes = require('./routes/cashCuts');
const printerRoutes = require('./routes/printer');

// Crear aplicación Express
const app = express();

// Configurar puerto
const PORT = process.env.PORT || 3001;

// Configurar rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana de tiempo
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde'
  }
});

// Configurar CORS
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middlewares
app.use(helmet()); // Seguridad básica
app.use(compression()); // Compresión gzip
app.use(limiter); // Rate limiting
app.use(cors(corsOptions)); // CORS
app.use(express.json({ limit: '10mb' })); // Parser JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parser URL-encoded

// Middleware de logging para desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cash-cuts', cashCutRoutes);
app.use('/api/printer', printerRoutes);

// Ruta de salud para verificar que el servidor funciona
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await checkConnection();
    
    // Verificar estado de la impresora
    let printerStatus = { connected: false, message: 'No inicializada' };
    try {
      const printerService = getThermalPrinterService();
      printerStatus = await printerService.getStatus();
    } catch (error) {
      printerStatus = { connected: false, message: 'Error al verificar impresora' };
    }
    
    res.json({
      success: true,
      message: 'Servidor funcionando correctamente',
      data: {
        server: 'OK',
        database: dbStatus ? 'OK' : 'ERROR',
        printer: printerStatus.connected ? 'OK' : 'VIRTUAL',
        printerInfo: printerStatus,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      data: {
        server: 'OK',
        database: 'ERROR',
        printer: 'ERROR',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Ruta catch-all para rutas no encontradas
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    data: {
      path: req.path,
      method: req.method
    }
  });
});

// Middleware global de manejo de errores
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Función para iniciar el servidor
async function startServer() {
  try {
    // Verificar conexión a base de datos
    console.log('🔍 Verificando conexión a base de datos...');
    const dbConnected = await checkConnection();
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      console.log('💡 Asegúrate de que MySQL esté ejecutándose y la configuración en .env sea correcta');
      process.exit(1);
    }

    // Inicializar impresora térmica
    console.log('🖨️  Inicializando sistema de impresión...');
    try {
      const printerService = getThermalPrinterService();
      await printerService.initialize();
    } catch (error) {
      console.log('⚠️  Impresora térmica no disponible - modo virtual activo');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('🎉 Servidor iniciado exitosamente!');
      console.log(`📡 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`🗄️  Base de datos: ${process.env.DB_NAME || 'pizzeria_db'}`);
      console.log(`🌐 CORS habilitado para: ${corsOptions.origin}`);
      console.log(`📊 API disponible en: http://localhost:${PORT}/api`);
      console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
      console.log('');
      console.log('📚 Endpoints disponibles:');
      console.log('  POST /api/auth/login - Login de usuarios');
      console.log('  GET  /api/auth/verify - Verificar token');
      console.log('  GET  /api/products - Listar productos');
      console.log('  GET  /api/orders - Listar órdenes activas');
      console.log('  POST /api/orders - Crear nueva orden');
      console.log('  GET  /api/users - Gestión de usuarios (admin)');
      console.log('  GET  /api/cash-cuts - Historial de cortes (admin)');
      console.log('  GET  /api/printer/status - Estado de impresora');
      console.log('  POST /api/printer/ticket/order/:id - Imprimir ticket');
      console.log('');
      console.log('🚀 ¡El backend está listo para recibir conexiones!');
    });

  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Manejo de cierre elegante
process.on('SIGINT', () => {
  console.log('\n⚡ Cerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚡ Cerrando servidor...');
  process.exit(0);
});

// Iniciar servidor si es ejecutado directamente
if (require.main === module) {
  startServer();
}

module.exports = app;
