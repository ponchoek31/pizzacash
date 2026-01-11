# Sistema de Pizzería - Backend MySQL

Sistema completo de punto de venta para pizzerías con base de datos MySQL, autenticación JWT, y API REST completa.

## 📋 Características

- ✅ **Autenticación JWT** con roles (Admin/Cajero)
- ✅ **Gestión completa de usuarios** (CRUD)
- ✅ **Catálogo de productos** dinámico
- ✅ **Sistema de órdenes** (teléfono/mostrador)
- ✅ **Cortes de caja** con arqueo completo
- ✅ **Búsqueda de órdenes** por teléfono
- ✅ **API REST** documentada
- ✅ **Seguridad** (helmet, rate limiting, CORS)
- ✅ **Base de datos MySQL** optimizada

## 🛠️ Requisitos Previos

### 1. Node.js
- **Versión**: 14.0 o superior
- **Descarga**: [nodejs.org](https://nodejs.org)

### 2. MySQL
- **Versión**: 5.7 o superior (recomendado 8.0+)
- **Opciones de instalación**:
  - [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
  - [XAMPP](https://www.apachefriends.org/) (incluye MySQL)
  - [WAMP](https://www.wampserver.com/) (incluye MySQL)

## 🚀 Instalación Rápida

### Paso 1: Clonar/Descargar el Proyecto
```bash
# Si tienes git
git clone <url-del-repositorio>
cd pizzeria-backend

# O simplemente extrae los archivos a una carpeta
```

### Paso 2: Instalar Dependencias
```bash
npm install
```

### Paso 3: Configurar Base de Datos
1. **Inicia MySQL** (XAMPP/WAMP o servicio de MySQL)
2. **Crea un usuario MySQL** (opcional):
   ```sql
   CREATE USER 'pizzeria_user'@'localhost' IDENTIFIED BY 'tu_password_segura';
   GRANT ALL PRIVILEGES ON *.* TO 'pizzeria_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Paso 4: Configurar Variables de Entorno
1. **Copia el archivo .env**:
   ```bash
   cp .env .env.local
   ```

2. **Edita `.env` con tus datos**:
   ```env
   # Configuración de MySQL
   DB_HOST=localhost
   DB_USER=root                    # o tu usuario MySQL
   DB_PASSWORD=                    # tu contraseña MySQL (vacío si es root sin password)
   DB_NAME=pizzeria_db
   DB_PORT=3306

   # Configuración del servidor
   PORT=3001
   NODE_ENV=development

   # Clave secreta JWT (¡CÁMBIALA en producción!)
   JWT_SECRET=tu_clave_super_segura_aqui_123456789
   JWT_EXPIRES_IN=24h

   # URL del frontend
   FRONTEND_URL=http://localhost:3000
   ```

### Paso 5: Configurar Base de Datos
```bash
npm run setup-db
```

**Este comando**:
- ✅ Crea la base de datos `pizzeria_db`
- ✅ Crea todas las tablas necesarias
- ✅ Inserta usuarios por defecto
- ✅ Inserta productos de ejemplo

### Paso 6: Iniciar el Servidor
```bash
# Desarrollo (con reinicio automático)
npm run dev

# Producción
npm start
```

### ✅ ¡Listo!
El servidor estará corriendo en: `http://localhost:3001`

## 👤 Usuarios por Defecto

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| `admin` | `admin123` | Administrador |
| `cajero1` | `password123` | Cajero |

## 📡 Endpoints de la API

### Autenticación
```bash
POST /api/auth/login          # Login de usuario
GET  /api/auth/verify         # Verificar token
```

### Productos
```bash
GET    /api/products          # Listar productos
POST   /api/products          # Crear producto (admin)
PUT    /api/products/:id      # Actualizar producto (admin)
DELETE /api/products/:id      # Eliminar producto (admin)
```

### Órdenes
```bash
GET    /api/orders            # Listar órdenes activas
POST   /api/orders            # Crear nueva orden
GET    /api/orders/:id        # Obtener orden específica
DELETE /api/orders/:id        # Eliminar orden
GET    /api/orders/search/phone/:phone  # Buscar por teléfono
GET    /api/orders/reports/cash         # Datos para corte de caja
POST   /api/orders/close                # Cerrar órdenes por cajero
```

### Usuarios (Solo Admin)
```bash
GET    /api/users             # Listar usuarios
POST   /api/users             # Crear usuario
PUT    /api/users/:id         # Actualizar usuario
DELETE /api/users/:id         # Eliminar usuario
```

### Cortes de Caja (Solo Admin)
```bash
GET    /api/cash-cuts         # Historial de cortes
POST   /api/cash-cuts         # Crear corte de caja
GET    /api/cash-cuts/:id     # Obtener corte específico
GET    /api/cash-cuts/stats   # Estadísticas de cortes
```

## 🔐 Autenticación

### Login
```javascript
// POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}

// Respuesta
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Usar Token
Incluir en el header de todas las peticiones:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 🗄️ Estructura de Base de Datos

### Tablas Principales:
- **`users`** - Usuarios del sistema
- **`products`** - Catálogo de productos
- **`orders`** - Órdenes de venta
- **`order_items`** - Items de cada orden
- **`cash_cuts`** - Historial de cortes de caja

## 🚨 Solución de Problemas

### Error: "Access denied for user 'root'@'localhost'"
```bash
# Opción 1: Sin contraseña
DB_PASSWORD=

# Opción 2: Con contraseña específica de MySQL
DB_PASSWORD=tu_password_mysql
```

### Error: "Database 'pizzeria_db' doesn't exist"
```bash
npm run setup-db
```

### Error: "ECONNREFUSED ::1:3306"
1. ✅ Verifica que MySQL esté corriendo
2. ✅ Revisa el puerto en `.env` (3306 por defecto)
3. ✅ Usa `127.0.0.1` en lugar de `localhost` si es necesario

### Puerto 3001 ocupado
```env
# En .env, cambia el puerto
PORT=3002
```

## 🔧 Scripts Disponibles

```bash
npm start          # Iniciar servidor (producción)
npm run dev        # Iniciar con nodemon (desarrollo)
npm run setup-db   # Configurar base de datos
```

## 📁 Estructura del Proyecto

```
pizzeria-backend/
├── config/
│   └── database.js         # Configuración MySQL
├── controllers/
│   ├── authController.js   # Autenticación
│   ├── userController.js   # Gestión usuarios
│   ├── productController.js # Gestión productos
│   ├── orderController.js  # Gestión órdenes
│   └── cashCutController.js # Cortes de caja
├── middleware/
│   └── auth.js             # Middleware JWT
├── models/
│   ├── User.js             # Modelo Usuario
│   ├── Product.js          # Modelo Producto
│   ├── Order.js            # Modelo Orden
│   └── CashCut.js          # Modelo Corte
├── routes/
│   ├── auth.js             # Rutas autenticación
│   ├── users.js            # Rutas usuarios
│   ├── products.js         # Rutas productos
│   ├── orders.js           # Rutas órdenes
│   └── cashCuts.js         # Rutas cortes
├── scripts/
│   └── setup-database.js   # Setup inicial DB
├── .env                    # Variables de entorno
├── package.json            # Dependencias
└── server.js              # Servidor principal
```

## 🔒 Seguridad en Producción

1. **Cambiar JWT_SECRET**:
   ```env
   JWT_SECRET=una_clave_muy_segura_y_larga_para_produccion
   ```

2. **Usar HTTPS** en producción

3. **Configurar firewall** para MySQL

4. **Variables de entorno**:
   ```env
   NODE_ENV=production
   ```

## 📞 Soporte

Si tienes problemas:
1. ✅ Verifica que MySQL esté corriendo
2. ✅ Revisa la configuración en `.env`
3. ✅ Ejecuta `npm run setup-db`
4. ✅ Revisa los logs del servidor

## 🎯 Próximos Pasos

1. **Conectar con el frontend** React
2. **Configurar impresoras** térmicas (opcional)
3. **Backup automático** de base de datos
4. **Deploy en servidor** de producción

---

¡El backend está listo para conectarse con tu sistema de pizzería! 🍕
