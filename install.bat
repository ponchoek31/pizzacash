@echo off
echo ===============================================
echo    SISTEMA DE PIZZERIA - INSTALACION BACKEND
echo ===============================================
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js no está instalado
    echo Por favor descarga e instala Node.js desde: https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js encontrado
node --version

echo.
echo [1/5] Instalando dependencias de Node.js...
call npm install
if errorlevel 1 (
    echo [ERROR] Fallo al instalar dependencias
    pause
    exit /b 1
)
echo [OK] Dependencias instaladas

echo.
echo [2/5] Configurando variables de entorno...
if not exist .env (
    echo [INFO] Creando archivo .env...
    (
        echo # Configuración de Base de Datos MySQL
        echo DB_HOST=localhost
        echo DB_USER=root
        echo DB_PASSWORD=
        echo DB_NAME=pizzeria_db
        echo DB_PORT=3306
        echo.
        echo # Configuración del Servidor
        echo PORT=3001
        echo NODE_ENV=development
        echo.
        echo # Configuración de Seguridad
        echo JWT_SECRET=tu_clave_secreta_super_segura_aqui_cambiala_en_produccion
        echo JWT_EXPIRES_IN=24h
        echo.
        echo # CORS Configuration
        echo FRONTEND_URL=http://localhost:3000
    ) > .env
    echo [OK] Archivo .env creado
) else (
    echo [OK] Archivo .env ya existe
)

echo.
echo [3/5] Verificando MySQL...
echo [INFO] Intentando conectar a MySQL...
echo [IMPORTANTE] Asegúrate de que MySQL esté ejecutándose antes de continuar
echo.
echo Si usas XAMPP: Inicia XAMPP y enciende MySQL
echo Si usas WAMP: Inicia WAMP y enciende MySQL  
echo Si instalaste MySQL directamente: Inicia el servicio MySQL
echo.
echo ¿MySQL está ejecutándose? (s/n):
set /p mysql_running=
if /i "%mysql_running%"=="n" (
    echo [INFO] Por favor inicia MySQL y vuelve a ejecutar este script
    echo.
    echo Guías rápidas:
    echo - XAMPP: Abre XAMPP Control Panel y click en "Start" para MySQL
    echo - WAMP: Click en icono WAMP y enciende MySQL
    echo - Servicio: Busca "Servicios" en Windows y inicia "MySQL"
    pause
    exit /b 1
)

echo.
echo [4/5] Configurando base de datos...
echo [INFO] Creando base de datos y tablas...
call npm run setup-db
if errorlevel 1 (
    echo.
    echo [ERROR] Fallo al configurar la base de datos
    echo.
    echo Posibles problemas:
    echo 1. MySQL no está ejecutándose
    echo 2. Credenciales incorrectas en .env
    echo 3. Permisos insuficientes
    echo.
    echo Para configurar manualmente:
    echo 1. Abre MySQL y ejecuta: CREATE DATABASE pizzeria_db;
    echo 2. Ajusta DB_USER y DB_PASSWORD en .env
    echo 3. Vuelve a ejecutar: npm run setup-db
    echo.
    pause
    exit /b 1
)
echo [OK] Base de datos configurada exitosamente

echo.
echo [5/5] Verificando instalación...
echo [INFO] Probando conexión...

REM Verificar que el archivo server.js existe
if not exist server.js (
    echo [ERROR] Archivo server.js no encontrado
    pause
    exit /b 1
)

echo [OK] Archivos del servidor encontrados

echo.
echo ===============================================
echo           INSTALACION COMPLETADA!
echo ===============================================
echo.
echo El backend del Sistema de Pizzería está listo para usar.
echo.
echo USUARIOS POR DEFECTO:
echo   Admin:  admin / admin123
echo   Cajero: cajero1 / password123
echo.
echo COMANDOS PARA INICIAR:
echo   npm run dev    (modo desarrollo)
echo   npm start      (modo producción)
echo.
echo SERVIDOR:
echo   URL: http://localhost:3001
echo   API: http://localhost:3001/api
echo.
echo PRÓXIMOS PASOS:
echo 1. Ejecuta: npm run dev
echo 2. Visita: http://localhost:3001/api/health
echo 3. Conecta tu frontend React
echo.
echo ¿Quieres iniciar el servidor ahora? (s/n):
set /p start_server=
if /i "%start_server%"=="s" (
    echo.
    echo [INFO] Iniciando servidor en modo desarrollo...
    echo [INFO] Presiona Ctrl+C para detener el servidor
    echo.
    call npm run dev
) else (
    echo.
    echo [INFO] Para iniciar más tarde, ejecuta: npm run dev
    echo [INFO] ¡Gracias por usar el Sistema de Pizzería!
)

echo.
pause
