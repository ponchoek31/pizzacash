# 🖨️ GUÍA DE CONFIGURACIÓN - IMPRESORAS TÉRMICAS

## 📋 RESUMEN

Tu sistema de pizzería ahora incluye soporte completo para impresoras térmicas profesionales. Esto te permite:

✅ **Imprimir tickets** automáticamente después de cada venta  
✅ **Cortes de caja** detallados con arqueo completo  
✅ **Soporte múltiples marcas** (Epson, Star, Bixolon, etc.)  
✅ **Conexión USB, Serie y Red** según tu impresora  
✅ **Modo virtual** si no tienes impresora física  

## 🖨️ IMPRESORAS COMPATIBLES

### **Marcas Soportadas:**
- **Epson** (TM-T20, TM-T70, TM-T88V, TM-T82)
- **Star Micronics** (TSP100, TSP650, TSP700)
- **Bixolon** (SRP-350, SRP-275, SRP-330)
- **Custom** (VKP80)
- **Citizen** (CT-S310, CT-S4000)
- **Y muchas más compatibles con ESC/POS**

### **Tipos de Conexión:**
1. **USB** - La más común y fácil de configurar
2. **Ethernet/Red** - Para impresoras de red
3. **Serie/RS232** - Para impresoras más antiguas

## ⚙️ CONFIGURACIÓN PASO A PASO

### **PASO 1: PREPARACIÓN**

#### Si tienes impresora física:
1. **Conecta tu impresora** (USB/Red/Serie)
2. **Instala drivers** si es necesario (Windows)
3. **Verifica que funciona** con una impresión de prueba

#### Si NO tienes impresora:
- ✅ **No hay problema** - el sistema funcionará en "modo virtual"
- Los tickets se mostrarán en consola
- Podrás conectar una impresora más tarde

### **PASO 2: CONFIGURACIÓN AUTOMÁTICA**

```bash
# Instalar dependencias adicionales
npm install

# El sistema detectará automáticamente tu impresora al iniciar
npm run dev
```

### **PASO 3: CONFIGURACIÓN MANUAL (Si es necesario)**

Edita el archivo `.env` con los datos de tu impresora:

#### **Para Impresora USB:**
```env
THERMAL_PRINTER_ENABLED=true
THERMAL_PRINTER_TYPE=usb
THERMAL_PRINTER_VENDOR_ID=0x04b8
THERMAL_PRINTER_PRODUCT_ID=0x0202
THERMAL_PRINTER_WIDTH=48
```

#### **Para Impresora de Red:**
```env
THERMAL_PRINTER_ENABLED=true
THERMAL_PRINTER_TYPE=network
THERMAL_PRINTER_IP=192.168.1.100
THERMAL_PRINTER_PORT=9100
THERMAL_PRINTER_WIDTH=48
```

#### **Para Impresora Serie:**
```env
THERMAL_PRINTER_ENABLED=true
THERMAL_PRINTER_TYPE=serial
THERMAL_PRINTER_SERIAL_PORT=COM3
THERMAL_PRINTER_BAUDRATE=9600
THERMAL_PRINTER_WIDTH=48
```

## 🔍 ENCONTRAR DATOS DE TU IMPRESORA

### **Windows - Encontrar Vendor/Product ID (USB):**
```cmd
# Abrir Device Manager
devmgmt.msc

# Buscar tu impresora en "Printers" o "Universal Serial Bus devices"
# Click derecho > Properties > Details > Hardware Ids
# Buscar: VID_04B8&PID_0202
```

### **Encontrar IP de Impresora de Red:**
```cmd
# Imprimir página de configuración desde tu impresora
# O usar comando ping para encontrar IP
ping impresora.local
```

## 📝 CONFIGURACIONES PREDEFINIDAS

### **Epson TM-T20:**
```env
THERMAL_PRINTER_TYPE=usb
THERMAL_PRINTER_VENDOR_ID=0x04b8
THERMAL_PRINTER_PRODUCT_ID=0x0202
```

### **Epson TM-T88V:**
```env
THERMAL_PRINTER_TYPE=usb
THERMAL_PRINTER_VENDOR_ID=0x04b8
THERMAL_PRINTER_PRODUCT_ID=0x020e
```

### **Star TSP100:**
```env
THERMAL_PRINTER_TYPE=usb
THERMAL_PRINTER_VENDOR_ID=0x0519
THERMAL_PRINTER_PRODUCT_ID=0x0003
```

## 🚀 CONFIGURACIÓN DE NEGOCIO

Personaliza la información que aparece en tus tickets:

```env
BUSINESS_NAME=Pizzería Deliciosa
BUSINESS_ADDRESS=Av. Principal 123, Centro
BUSINESS_PHONE=555-123-4567
BUSINESS_TAX_ID=RFC123456789
BUSINESS_WEBSITE=www.pizzeriadeliciosa.com
```

## 🧪 TESTING

### **1. Verificar Estado:**
```bash
curl http://localhost:3001/api/printer/status
```

### **2. Test de Impresión:**
```bash
curl -X POST http://localhost:3001/api/printer/test \
  -H "Authorization: Bearer TU_TOKEN"
```

### **3. Imprimir Ticket de Orden:**
```bash
curl -X POST http://localhost:3001/api/printer/ticket/order/123 \
  -H "Authorization: Bearer TU_TOKEN"
```

## 📡 API ENDPOINTS

### **Estado de Impresora:**
```javascript
// GET /api/printer/status
{
  "success": true,
  "data": {
    "connected": true,
    "type": "usb",
    "width": 48,
    "message": "Impresora conectada"
  }
}
```

### **Imprimir Ticket:**
```javascript
// POST /api/printer/ticket/order/:orderId
// Respuesta:
{
  "success": true,
  "message": "Ticket impreso correctamente"
}
```

### **Imprimir Corte de Caja:**
```javascript
// POST /api/printer/ticket/cash-cut/:cutId
// Respuesta:
{
  "success": true,
  "message": "Corte de caja impreso correctamente"
}
```

## 🔧 INTEGRACIÓN CON FRONTEND

### **Verificar Estado de Impresora:**
```javascript
const checkPrinterStatus = async () => {
  const response = await fetch('/api/printer/status', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log('Impresora:', data.data.connected ? 'Conectada' : 'Desconectada');
};
```

### **Imprimir Ticket Automáticamente:**
```javascript
const printOrderTicket = async (orderId) => {
  try {
    const response = await fetch(`/api/printer/ticket/order/${orderId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    if (result.success) {
      console.log('✅ Ticket impreso');
    } else {
      console.log('📄 Ticket virtual generado');
    }
  } catch (error) {
    console.error('Error imprimiendo:', error);
  }
};
```

## 🚨 SOLUCIÓN DE PROBLEMAS

### **❌ "Impresora no encontrada"**
**Soluciones:**
1. Verifica conexión física (USB/Red)
2. Instala drivers de la impresora
3. Revisa Vendor/Product IDs en `.env`
4. Prueba cambiar puerto USB

### **❌ "Permission denied"**
**Soluciones (Linux/Mac):**
```bash
sudo chmod 666 /dev/ttyUSB0
# O agregar usuario a grupo dialout
sudo usermod -a -G dialout $USER
```

### **❌ "Network printer not responding"**
**Soluciones:**
1. Verifica IP de la impresora
2. Ping a la IP: `ping 192.168.1.100`
3. Verifica puerto (normalmente 9100)
4. Revisa firewall/antivirus

### **❌ "Caracteres extraños en tickets"**
**Soluciones:**
```env
# Cambia encoding en .env
THERMAL_PRINTER_ENCODING=CP850
# O prueba: CP857, CP858, UTF-8
```

### **⚠️ Modo Virtual Activo**
Si no tienes impresora física:
- ✅ El sistema funciona normalmente
- Los tickets aparecen en la consola del servidor
- Puedes conectar impresora más tarde sin problema

## 📊 FORMATOS DE TICKETS

### **Ticket de Venta:**
```
=======================================
           PIZZERÍA DELICIOSA
=======================================
Av. Principal 123, Centro
Tel: 555-123-4567
RFC: RFC123456789

---------------------------------------
TICKET #1234
---------------------------------------
Fecha: 09/01/2026 14:30:25
Cajero: María García
Tipo: Teléfono
Cliente: Juan Pérez
Teléfono: 555-987-6543
Dirección: Calle 5 de Mayo #45

---------------------------------------
PRODUCTOS
---------------------------------------
Pizza Margarita Grande
 x2                              $240.00
Refresco Coca Cola
 x1                               $25.00

---------------------------------------
TOTAL:                          $265.00
Pagado:                         $300.00
Cambio:                          $35.00

---------------------------------------
¡Gracias por su preferencia!
www.pizzeriadeliciosa.com
=======================================
```

### **Corte de Caja:**
```
=======================================
              CORTE DE CAJA
=======================================
PIZZERÍA DELICIOSA

Fecha: 09/01/2026 23:59:59
Cajero: María García
Cerrado por: Supervisor

---------------------------------------
RESUMEN DE VENTAS
---------------------------------------
Total órdenes:                       45
Telefónicas:                         28
Mostrador:                           17

---------------------------------------
FORMAS DE PAGO
---------------------------------------
Efectivo:                    $2,150.00
Tarjeta:                       $890.00

---------------------------------------
ARQUEO DE CAJA
---------------------------------------
Fondo inicial:                 $200.00
Efectivo esperado:           $2,350.00
Efectivo contado:            $2,355.00
Vouchers:                      $890.00

---------------------------------------
SOBRANTE:                        $5.00

=======================================
TOTAL VENTAS:                $3,040.00
=======================================

_____________________    _____________________
Firma del Cajero         Firma del Supervisor
```

## 🎯 BENEFICIOS

### **Para el Negocio:**
✅ **Profesionalismo** - Tickets impresos automáticamente  
✅ **Control** - Registro físico de todas las ventas  
✅ **Eficiencia** - No más tickets escritos a mano  
✅ **Contabilidad** - Cortes de caja detallados  

### **Para los Clientes:**
✅ **Tickets claros** con toda la información  
✅ **Comprobante fiscal** con datos del negocio  
✅ **Información completa** de productos y precios  

### **Para el Personal:**
✅ **Automático** - Sin pasos extra para imprimir  
✅ **Respaldo** - Si falla la impresora, continúa funcionando  
✅ **Fácil configuración** - Auto-detección de impresoras  

---

🍕 **¡Tu sistema ahora es completamente profesional con impresión térmica!** 🖨️

**Próximo paso:** Conecta tu impresora y ¡empieza a vender!
