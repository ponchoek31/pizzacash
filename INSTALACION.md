# 🚀 GUÍA DE INSTALACIÓN COMPLETA
# Sistema de Pizzería - Backend MySQL

## 📋 RESUMEN RÁPIDO

**Este backend proporcionará:**
- ✅ API REST completa para tu sistema de pizzería
- ✅ Base de datos MySQL con todas las tablas necesarias
- ✅ Autenticación segura con JWT
- ✅ Gestión completa de usuarios, productos, órdenes y cortes de caja
- ✅ Conexión directa con tu frontend React

## 🎯 INSTALACIÓN AUTOMÁTICA (RECOMENDADA)

### Para Windows:
1. Descarga todos los archivos del backend
2. Asegúrate de tener MySQL ejecutándose (XAMPP/WAMP)
3. Doble-click en `install.bat`
4. Sigue las instrucciones en pantalla
5. ¡Listo!

### Para Mac/Linux:
```bash
chmod +x install.sh
./install.sh
```

## 🔧 INSTALACIÓN MANUAL (PASO A PASO)

### PASO 1: REQUISITOS
- **Node.js** 14+ → [nodejs.org](https://nodejs.org)
- **MySQL** 5.7+ → [mysql.com](https://dev.mysql.com/downloads/) o XAMPP

### PASO 2: DESCARGAR ARCHIVOS
Extrae todos los archivos del backend a una carpeta, ejemplo:
```
C:\pizzeria-backend\
```

### PASO 3: INSTALAR DEPENDENCIAS
```bash
cd pizzeria-backend
npm install
```

### PASO 4: CONFIGURAR MYSQL
#### Opción A: XAMPP/WAMP (Más fácil)
1. Inicia XAMPP/WAMP
2. Enciende MySQL desde el panel de control
3. No necesitas crear base de datos, el sistema lo hace automáticamente

#### Opción B: MySQL Nativo
1. Inicia el servicio MySQL
2. Conecta como root o crea un usuario específico

### PASO 5: CONFIGURAR VARIABLES (.env)
Edita el archivo `.env` con tus datos de MySQL:

```env
# XAMPP/WAMP (configuración típica)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=pizzeria_db
DB_PORT=3306

# MySQL con contraseña
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=pizzeria_db
DB_PORT=3306

# Configuración del servidor
PORT=3001
NODE_ENV=development
JWT_SECRET=cambia_esto_por_algo_super_seguro
FRONTEND_URL=http://localhost:3000
```

### PASO 6: CONFIGURAR BASE DE DATOS
```bash
npm run setup-db
```

**Esto creará automáticamente:**
- Base de datos `pizzeria_db`
- Todas las tablas necesarias
- Usuarios por defecto (admin/cajero)
- Productos de ejemplo

### PASO 7: INICIAR SERVIDOR
```bash
# Desarrollo (recomendado)
npm run dev

# Producción
npm start
```

## ✅ VERIFICACIÓN

### 1. Servidor funcionando
Visita: `http://localhost:3001/api/health`

Deberías ver:
```json
{
  "success": true,
  "message": "Servidor funcionando correctamente",
  "data": {
    "server": "OK",
    "database": "OK"
  }
}
```

### 2. Login funcional
```bash
# Test con curl
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 🎮 USUARIOS POR DEFECTO

| Usuario | Contraseña | Rol | Descripción |
|---------|------------|-----|-------------|
| `admin` | `admin123` | Admin | Acceso completo al sistema |
| `cajero1` | `password123` | Cajero | Operaciones de venta |

## 🔌 CONEXIÓN CON FRONTEND

### En tu componente React:
```javascript
// Configurar la URL base de la API
const API_URL = 'http://localhost:3001/api';

// Ejemplo de login
const login = async (username, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    return data.data.user;
  }
  throw new Error(data.message);
};

// Ejemplo de crear orden
const createOrder = async (orderData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(orderData)
  });
  
  return await response.json();
};
```

## 📁 ESTRUCTURA DE ARCHIVOS PRINCIPALES

```
pizzeria-backend/
├── server.js              # Servidor principal
├── package.json           # Dependencias
├── .env                   # Configuración
├── install.bat            # Instalador Windows
├── README.md              # Documentación
├── config/
│   └── database.js        # Conexión MySQL
├── models/                # Modelos de datos
├── controllers/           # Lógica de negocio
├── routes/               # Endpoints API
└── scripts/
    └── setup-database.js  # Configuración inicial
```

## 🚨 SOLUCIÓN DE PROBLEMAS COMUNES

### ❌ Error: "Cannot connect to database"
**Solución:**
1. Verifica que MySQL esté ejecutándose
2. Revisa credenciales en `.env`
3. Prueba conexión manual:
   ```bash
   mysql -u root -p
   ```

### ❌ Error: "Port 3001 is already in use"
**Solución:**
```env
# Cambia el puerto en .env
PORT=3002
```

### ❌ Error: "JWT_SECRET is not defined"
**Solución:**
```env
# Agrega en .env
JWT_SECRET=tu_clave_secreta_aqui
```

### ❌ Error: "CORS policy"
**Solución:**
```env
# Verifica en .env
FRONTEND_URL=http://localhost:3000
```

## 📊 ENDPOINTS DISPONIBLES

### 🔐 Autenticación
```
POST /api/auth/login          # Iniciar sesión
GET  /api/auth/verify         # Verificar token
```

### 🍕 Productos
```
GET    /api/products          # Listar productos
POST   /api/products          # Crear producto (admin)
PUT    /api/products/:id      # Editar producto (admin)
DELETE /api/products/:id      # Eliminar producto (admin)
```

### 📋 Órdenes
```
GET    /api/orders            # Órdenes activas
POST   /api/orders            # Nueva orden
DELETE /api/orders/:id        # Eliminar orden
GET    /api/orders/search/phone/:phone  # Buscar por teléfono
```

### 👥 Usuarios (Admin)
```
GET    /api/users             # Listar usuarios
POST   /api/users             # Crear usuario
PUT    /api/users/:id         # Editar usuario
DELETE /api/users/:id         # Eliminar usuario
```

### 💰 Cortes de Caja (Admin)
```
GET    /api/cash-cuts         # Historial
POST   /api/cash-cuts         # Cerrar corte
```

## 🔐 CONFIGURACIÓN DE SEGURIDAD

### Para Producción:
```env
NODE_ENV=production
JWT_SECRET=una_clave_muy_larga_y_segura_para_produccion
DB_PASSWORD=password_seguro_mysql
```

## 📞 SOPORTE Y CONTACTO

### Si algo no funciona:
1. ✅ Revisa que MySQL esté corriendo
2. ✅ Verifica archivos `.env`
3. ✅ Ejecuta `npm run setup-db`
4. ✅ Reinicia el servidor (`Ctrl+C` luego `npm run dev`)

### Logs útiles:
```bash
# Ver errores detallados
npm run dev
```

## 🎉 ¡FELICITACIONES!

Tu backend está listo para:
- ✅ Recibir órdenes desde el frontend
- ✅ Gestionar productos y usuarios
- ✅ Manejar cortes de caja por cajero
- ✅ Búsquedas de órdenes
- ✅ Autenticación segura

**Siguiente paso:** Conecta tu frontend React usando los endpoints de la API

---

🍕 **¡Tu sistema de pizzería está funcionando!** 🍕
