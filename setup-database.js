const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de conexión inicial (sin especificar base de datos)
const connectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'P0nch0.311088',
  port: process.env.DB_PORT || 3306
};

async function setupDatabase() {
  let connection;
  
  try {
    // Conectar a MySQL sin especificar base de datos
    connection = await mysql.createConnection(connectionConfig);
    console.log('🔌 Conectado a MySQL');
    
    // Crear base de datos si no existe
    const dbName = process.env.DB_NAME || 'pizzeria_db';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Base de datos '${dbName}' creada/verificada`);
    
    // Usar la base de datos
    await connection.execute(`USE ${dbName}`);
    
    // Crear tabla de usuarios
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role ENUM('admin', 'cajero') DEFAULT 'cajero',
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    // Crear tabla de productos
    const createProductsTable = `
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    // Crear tabla de órdenes
    const createOrdersTable = `
      CREATE TABLE IF NOT EXISTS orders (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(100),
        phone VARCHAR(20),
        address TEXT,
        type ENUM('telefono', 'mostrador') NOT NULL,
        payment_method ENUM('efectivo', 'tarjeta') NOT NULL,
        amount_paid DECIMAL(10,2),
        change_amount DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        cashier VARCHAR(100) NOT NULL,
        status ENUM('activa', 'cerrada') DEFAULT 'activa',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        closed_at TIMESTAMP NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    // Crear tabla de items de órdenes
    const createOrderItemsTable = `
      CREATE TABLE IF NOT EXISTS order_items (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        order_id BIGINT NOT NULL,
        product_id INT NOT NULL,
        product_name VARCHAR(100) NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    // Crear tabla de cortes de caja
    const createCashCutsTable = `
      CREATE TABLE IF NOT EXISTS cash_cuts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cashier VARCHAR(100) NOT NULL,
        initial_fund DECIMAL(10,2) NOT NULL,
        final_cash DECIMAL(10,2) NOT NULL,
        voucher_total DECIMAL(10,2) NOT NULL,
        expected_cash DECIMAL(10,2) NOT NULL,
        difference DECIMAL(10,2) NOT NULL,
        total_sales DECIMAL(10,2) NOT NULL,
        total_orders INT NOT NULL,
        cash_orders INT NOT NULL,
        card_orders INT NOT NULL,
        phone_orders INT NOT NULL,
        counter_orders INT NOT NULL,
        closed_by VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    // Ejecutar creación de tablas
    await connection.execute(createUsersTable);
    console.log('✅ Tabla users creada');
    
    await connection.execute(createProductsTable);
    console.log('✅ Tabla products creada');
    
    await connection.execute(createOrdersTable);
    console.log('✅ Tabla orders creada');
    
    await connection.execute(createOrderItemsTable);
    console.log('✅ Tabla order_items creada');
    
    await connection.execute(createCashCutsTable);
    console.log('✅ Tabla cash_cuts creada');
    
    // Insertar usuarios por defecto
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const cashierPassword = await bcrypt.hash('password123', 10);
    
    // Verificar si ya existen usuarios
    const [existingUsers] = await connection.execute('SELECT COUNT(*) as count FROM users');
    
    if (existingUsers[0].count === 0) {
      await connection.execute(
        'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
        ['admin', adminPassword, 'Administrador', 'admin']
      );
      
      await connection.execute(
        'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
        ['cajero1', cashierPassword, 'Cajero 1', 'cajero']
      );
      
      console.log('✅ Usuarios por defecto creados');
    }
    
    // Insertar productos por defecto
    const [existingProducts] = await connection.execute('SELECT COUNT(*) as count FROM products');
    
    if (existingProducts[0].count === 0) {
      const defaultProducts = [
        ['Margarita', 120],
        ['Pepperoni', 150],
        ['Hawaiana', 145],
        ['Mexicana', 160],
        ['Vegetariana', 140],
        ['Cuatro Quesos', 165],
        ['Carnes Frías', 170],
        ['Suprema', 180]
      ];
      
      for (const [name, price] of defaultProducts) {
        await connection.execute(
          'INSERT INTO products (name, price) VALUES (?, ?)',
          [name, price]
        );
      }
      
      console.log('✅ Productos por defecto creados');
    }
    
    console.log('🎉 Base de datos configurada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error configurando base de datos:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('✅ Configuración completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = setupDatabase;
