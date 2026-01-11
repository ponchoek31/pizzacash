const { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } = require('node-thermal-printer');
const escpos = require('escpos');
const USB = require('escpos/adapter/usb');
const Network = require('escpos/adapter/network');
const Serial = require('escpos/adapter/serial');
const iconv = require('iconv-lite');

class ThermalPrinterService {
  constructor() {
    this.printer = null;
    this.isConnected = false;
    this.printerType = process.env.THERMAL_PRINTER_TYPE || 'usb';
    this.printerWidth = parseInt(process.env.THERMAL_PRINTER_WIDTH) || 48;
    this.encoding = process.env.THERMAL_PRINTER_ENCODING || 'CP857';
    
    // Configuración del negocio
    this.businessInfo = {
      name: process.env.BUSINESS_NAME || 'Pizzería',
      address: process.env.BUSINESS_ADDRESS || '',
      phone: process.env.BUSINESS_PHONE || '',
      taxId: process.env.BUSINESS_TAX_ID || '',
      website: process.env.BUSINESS_WEBSITE || ''
    };
  }

  // Inicializar la impresora
  async initialize() {
    try {
      if (process.env.THERMAL_PRINTER_ENABLED !== 'true') {
        console.log('📄 Impresora térmica deshabilitada - usando impresión virtual');
        return false;
      }

      console.log('🖨️  Inicializando impresora térmica...');
      
      switch (this.printerType.toLowerCase()) {
        case 'usb':
          await this.initializeUSB();
          break;
        case 'network':
          await this.initializeNetwork();
          break;
        case 'serial':
          await this.initializeSerial();
          break;
        default:
          await this.initializeAuto();
      }

      if (this.isConnected) {
        console.log('✅ Impresora térmica conectada exitosamente');
        await this.testPrint();
      }

      return this.isConnected;
    } catch (error) {
      console.error('❌ Error inicializando impresora térmica:', error.message);
      console.log('📄 Continuando con impresión virtual...');
      return false;
    }
  }

  // Inicializar impresora USB
  async initializeUSB() {
    try {
      // Configuración usando node-thermal-printer
      this.printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: 'usb',
        width: this.printerWidth,
        characterSet: CharacterSet.PC857_TURKISH,
        removeSpecialCharacters: false,
        lineCharacter: "=",
      });

      // Configuración USB específica
      if (process.env.THERMAL_PRINTER_VENDOR_ID && process.env.THERMAL_PRINTER_PRODUCT_ID) {
        this.printer.usbVendorId = parseInt(process.env.THERMAL_PRINTER_VENDOR_ID);
        this.printer.usbProductId = parseInt(process.env.THERMAL_PRINTER_PRODUCT_ID);
      }

      const isConnected = await this.printer.isPrinterConnected();
      this.isConnected = isConnected;
      
    } catch (error) {
      console.error('Error conectando impresora USB:', error);
      this.isConnected = false;
    }
  }

  // Inicializar impresora de red
  async initializeNetwork() {
    try {
      this.printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: `tcp://${process.env.THERMAL_PRINTER_IP}:${process.env.THERMAL_PRINTER_PORT || 9100}`,
        width: this.printerWidth,
        characterSet: CharacterSet.PC857_TURKISH,
      });

      const isConnected = await this.printer.isPrinterConnected();
      this.isConnected = isConnected;
      
    } catch (error) {
      console.error('Error conectando impresora de red:', error);
      this.isConnected = false;
    }
  }

  // Inicializar impresora serial
  async initializeSerial() {
    try {
      this.printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: `serial:${process.env.THERMAL_PRINTER_SERIAL_PORT}`,
        width: this.printerWidth,
        characterSet: CharacterSet.PC857_TURKISH,
        options: {
          baudRate: parseInt(process.env.THERMAL_PRINTER_BAUDRATE) || 9600,
        }
      });

      const isConnected = await this.printer.isPrinterConnected();
      this.isConnected = isConnected;
      
    } catch (error) {
      console.error('Error conectando impresora serial:', error);
      this.isConnected = false;
    }
  }

  // Auto-detectar impresora
  async initializeAuto() {
    try {
      // Intentar USB primero
      await this.initializeUSB();
      if (this.isConnected) return;

      // Luego red si está configurada
      if (process.env.THERMAL_PRINTER_IP) {
        await this.initializeNetwork();
        if (this.isConnected) return;
      }

      // Finalmente serial si está configurado
      if (process.env.THERMAL_PRINTER_SERIAL_PORT) {
        await this.initializeSerial();
      }
    } catch (error) {
      console.error('Error en auto-detección:', error);
      this.isConnected = false;
    }
  }

  // Imprimir ticket de orden
  async printOrderTicket(orderData) {
    try {
      if (!this.isConnected) {
        console.log('📄 Generando ticket virtual para orden:', orderData.id);
        return this.generateVirtualTicket(orderData);
      }

      console.log('🖨️  Imprimiendo ticket para orden:', orderData.id);
      
      this.printer.clear();

      // Header del negocio
      this.printer.alignCenter();
      this.printer.setTextSize(2, 2);
      this.printer.bold(true);
      this.printer.println(this.businessInfo.name);
      this.printer.bold(false);
      this.printer.setTextSize(1, 1);
      
      if (this.businessInfo.address) {
        this.printer.println(this.businessInfo.address);
      }
      if (this.businessInfo.phone) {
        this.printer.println(`Tel: ${this.businessInfo.phone}`);
      }
      if (this.businessInfo.taxId) {
        this.printer.println(`RFC: ${this.businessInfo.taxId}`);
      }

      this.printer.drawLine();

      // Información de la orden
      this.printer.alignLeft();
      this.printer.bold(true);
      this.printer.println(`TICKET #${orderData.id}`);
      this.printer.bold(false);
      this.printer.println(`Fecha: ${orderData.timestamp}`);
      this.printer.println(`Cajero: ${orderData.cashier}`);
      this.printer.println(`Tipo: ${orderData.type === 'telefono' ? 'Telefono' : 'Mostrador'}`);

      if (orderData.type === 'telefono') {
        this.printer.println(`Cliente: ${orderData.customerName}`);
        this.printer.println(`Telefono: ${orderData.phone}`);
        this.printer.println(`Direccion: ${orderData.address}`);
      } else if (orderData.customerName && orderData.customerName !== 'Cliente Mostrador') {
        this.printer.println(`Cliente: ${orderData.customerName}`);
      }

      this.printer.drawLine();

      // Items de la orden
      this.printer.bold(true);
      this.printer.println('PRODUCTOS');
      this.printer.bold(false);
      this.printer.drawLine();

      orderData.items.forEach(item => {
        const itemName = item.name.length > 20 ? item.name.substring(0, 20) : item.name;
        const quantity = `x${item.quantity}`;
        const price = `$${(item.price * item.quantity).toFixed(2)}`;
        
        this.printer.println(itemName);
        this.printer.tableCustom([
          { text: '', align: "LEFT", width: 0.1 },
          { text: quantity, align: "LEFT", width: 0.3 },
          { text: price, align: "RIGHT", width: 0.6 }
        ]);
      });

      this.printer.drawLine();

      // Total
      this.printer.bold(true);
      this.printer.setTextSize(1, 2);
      this.printer.tableCustom([
        { text: "TOTAL:", align: "LEFT", width: 0.7 },
        { text: `$${orderData.total.toFixed(2)}`, align: "RIGHT", width: 0.3 }
      ]);
      this.printer.setTextSize(1, 1);

      // Información de pago
      if (orderData.paymentMethod === 'efectivo') {
        this.printer.tableCustom([
          { text: "Pagado:", align: "LEFT", width: 0.7 },
          { text: `$${orderData.amountPaid.toFixed(2)}`, align: "RIGHT", width: 0.3 }
        ]);
        this.printer.tableCustom([
          { text: "Cambio:", align: "LEFT", width: 0.7 },
          { text: `$${orderData.change.toFixed(2)}`, align: "RIGHT", width: 0.3 }
        ]);
      } else {
        this.printer.println(`Pago: ${orderData.paymentMethod.toUpperCase()}`);
      }

      this.printer.bold(false);
      this.printer.drawLine();

      // Footer
      this.printer.alignCenter();
      this.printer.println('¡Gracias por su preferencia!');
      if (this.businessInfo.website) {
        this.printer.println(this.businessInfo.website);
      }

      this.printer.cut();
      
      // Enviar a imprimir
      const result = await this.printer.execute();
      console.log('✅ Ticket impreso exitosamente');
      return { success: true, message: 'Ticket impreso correctamente' };

    } catch (error) {
      console.error('❌ Error imprimiendo ticket:', error);
      return { success: false, message: 'Error al imprimir ticket', error: error.message };
    }
  }

  // Imprimir corte de caja
  async printCashCutReport(cutData) {
    try {
      if (!this.isConnected) {
        console.log('📄 Generando reporte virtual de corte de caja');
        return this.generateVirtualCashCut(cutData);
      }

      console.log('🖨️  Imprimiendo corte de caja');
      
      this.printer.clear();

      // Header
      this.printer.alignCenter();
      this.printer.setTextSize(2, 2);
      this.printer.bold(true);
      this.printer.println('CORTE DE CAJA');
      this.printer.bold(false);
      this.printer.setTextSize(1, 1);
      this.printer.println(this.businessInfo.name);
      this.printer.drawLine();

      // Información del corte
      this.printer.alignLeft();
      this.printer.println(`Fecha: ${cutData.date}`);
      this.printer.println(`Cajero: ${cutData.cashier === 'todos' ? 'TODOS' : cutData.cashier}`);
      this.printer.println(`Cerrado por: ${cutData.closedBy}`);
      this.printer.drawLine();

      // Resumen de ventas
      this.printer.bold(true);
      this.printer.println('RESUMEN DE VENTAS');
      this.printer.bold(false);
      this.printer.tableCustom([
        { text: "Total ordenes:", align: "LEFT", width: 0.7 },
        { text: cutData.totalOrders.toString(), align: "RIGHT", width: 0.3 }
      ]);
      this.printer.tableCustom([
        { text: "Telefonicas:", align: "LEFT", width: 0.7 },
        { text: cutData.phoneOrders.toString(), align: "RIGHT", width: 0.3 }
      ]);
      this.printer.tableCustom([
        { text: "Mostrador:", align: "LEFT", width: 0.7 },
        { text: cutData.counterOrders.toString(), align: "RIGHT", width: 0.3 }
      ]);
      this.printer.drawLine();

      // Formas de pago
      this.printer.bold(true);
      this.printer.println('FORMAS DE PAGO');
      this.printer.bold(false);
      this.printer.tableCustom([
        { text: "Efectivo:", align: "LEFT", width: 0.7 },
        { text: `$${(cutData.totalSales - (cutData.totalCard || 0)).toFixed(2)}`, align: "RIGHT", width: 0.3 }
      ]);
      this.printer.tableCustom([
        { text: "Tarjeta:", align: "LEFT", width: 0.7 },
        { text: `$${(cutData.totalCard || 0).toFixed(2)}`, align: "RIGHT", width: 0.3 }
      ]);
      this.printer.drawLine();

      // Arqueo de caja
      this.printer.bold(true);
      this.printer.println('ARQUEO DE CAJA');
      this.printer.bold(false);
      this.printer.tableCustom([
        { text: "Fondo inicial:", align: "LEFT", width: 0.7 },
        { text: `$${cutData.initialFund.toFixed(2)}`, align: "RIGHT", width: 0.3 }
      ]);
      this.printer.tableCustom([
        { text: "Efectivo esperado:", align: "LEFT", width: 0.7 },
        { text: `$${cutData.expectedCash.toFixed(2)}`, align: "RIGHT", width: 0.3 }
      ]);
      this.printer.tableCustom([
        { text: "Efectivo contado:", align: "LEFT", width: 0.7 },
        { text: `$${cutData.finalCash.toFixed(2)}`, align: "RIGHT", width: 0.3 }
      ]);
      this.printer.tableCustom([
        { text: "Vouchers:", align: "LEFT", width: 0.7 },
        { text: `$${cutData.voucherTotal.toFixed(2)}`, align: "RIGHT", width: 0.3 }
      ]);
      
      this.printer.drawLine();
      
      // Diferencia
      this.printer.bold(true);
      this.printer.setTextSize(1, 2);
      const differenceText = cutData.difference >= 0 ? 'SOBRANTE:' : 'FALTANTE:';
      this.printer.tableCustom([
        { text: differenceText, align: "LEFT", width: 0.7 },
        { text: `$${Math.abs(cutData.difference).toFixed(2)}`, align: "RIGHT", width: 0.3 }
      ]);
      this.printer.setTextSize(1, 1);
      this.printer.bold(false);
      
      this.printer.drawLine();

      // Total de ventas
      this.printer.bold(true);
      this.printer.setTextSize(2, 2);
      this.printer.alignCenter();
      this.printer.println(`TOTAL: $${cutData.totalSales.toFixed(2)}`);
      this.printer.setTextSize(1, 1);
      this.printer.bold(false);

      // Firmas
      this.printer.alignLeft();
      this.printer.newLine();
      this.printer.newLine();
      this.printer.println('_________________________');
      this.printer.println('Firma del Cajero');
      this.printer.newLine();
      this.printer.println('_________________________');
      this.printer.println('Firma del Supervisor');

      this.printer.cut();
      
      const result = await this.printer.execute();
      console.log('✅ Corte de caja impreso exitosamente');
      return { success: true, message: 'Corte de caja impreso correctamente' };

    } catch (error) {
      console.error('❌ Error imprimiendo corte de caja:', error);
      return { success: false, message: 'Error al imprimir corte de caja', error: error.message };
    }
  }

  // Test de impresión
  async testPrint() {
    try {
      if (!this.isConnected) return;

      this.printer.clear();
      this.printer.alignCenter();
      this.printer.bold(true);
      this.printer.println('TEST DE IMPRESORA');
      this.printer.bold(false);
      this.printer.println(`Fecha: ${new Date().toLocaleString('es-MX')}`);
      this.printer.drawLine();
      this.printer.println('Impresora conectada correctamente');
      this.printer.alignLeft();
      this.printer.newLine();
      this.printer.cut();

      await this.printer.execute();
      console.log('✅ Test de impresión exitoso');
    } catch (error) {
      console.error('❌ Error en test de impresión:', error);
    }
  }

  // Generar ticket virtual (para cuando no hay impresora física)
  generateVirtualTicket(orderData) {
    const ticketText = `
=======================================
           ${this.businessInfo.name}
=======================================
${this.businessInfo.address}
Tel: ${this.businessInfo.phone}
RFC: ${this.businessInfo.taxId}

---------------------------------------
TICKET #${orderData.id}
---------------------------------------
Fecha: ${orderData.timestamp}
Cajero: ${orderData.cashier}
Tipo: ${orderData.type === 'telefono' ? 'Teléfono' : 'Mostrador'}
${orderData.customerName ? `Cliente: ${orderData.customerName}` : ''}
${orderData.phone ? `Teléfono: ${orderData.phone}` : ''}
${orderData.address ? `Dirección: ${orderData.address}` : ''}

---------------------------------------
PRODUCTOS
---------------------------------------
${orderData.items.map(item => 
  `${item.name}
 x${item.quantity}                    $${(item.price * item.quantity).toFixed(2)}`
).join('\n')}

---------------------------------------
TOTAL:                      $${orderData.total.toFixed(2)}
${orderData.paymentMethod === 'efectivo' ? `Pagado:                     $${orderData.amountPaid.toFixed(2)}
Cambio:                     $${orderData.change.toFixed(2)}` : `Pago: ${orderData.paymentMethod.toUpperCase()}`}

---------------------------------------
¡Gracias por su preferencia!
${this.businessInfo.website}
=======================================
    `;

    console.log('📄 TICKET VIRTUAL:\n', ticketText);
    return { success: true, message: 'Ticket virtual generado', data: ticketText };
  }

  // Generar corte de caja virtual
  generateVirtualCashCut(cutData) {
    const cutText = `
=======================================
              CORTE DE CAJA
=======================================
${this.businessInfo.name}

Fecha: ${cutData.date}
Cajero: ${cutData.cashier === 'todos' ? 'TODOS' : cutData.cashier}
Cerrado por: ${cutData.closedBy}

---------------------------------------
RESUMEN DE VENTAS
---------------------------------------
Total órdenes:              ${cutData.totalOrders}
Telefónicas:               ${cutData.phoneOrders}
Mostrador:                 ${cutData.counterOrders}

---------------------------------------
ARQUEO DE CAJA
---------------------------------------
Fondo inicial:         $${cutData.initialFund.toFixed(2)}
Efectivo esperado:     $${cutData.expectedCash.toFixed(2)}
Efectivo contado:      $${cutData.finalCash.toFixed(2)}
Vouchers:              $${cutData.voucherTotal.toFixed(2)}

---------------------------------------
${cutData.difference >= 0 ? 'SOBRANTE' : 'FALTANTE'}:                 $${Math.abs(cutData.difference).toFixed(2)}

=======================================
TOTAL VENTAS:          $${cutData.totalSales.toFixed(2)}
=======================================

_____________________    _____________________
Firma del Cajero         Firma del Supervisor
    `;

    console.log('📄 CORTE DE CAJA VIRTUAL:\n', cutText);
    return { success: true, message: 'Corte de caja virtual generado', data: cutText };
  }

  // Verificar estado de la impresora
  async getStatus() {
    try {
      if (!this.isConnected) {
        return { connected: false, message: 'Impresora no conectada - modo virtual activo' };
      }

      const isConnected = await this.printer.isPrinterConnected();
      return { 
        connected: isConnected, 
        type: this.printerType,
        width: this.printerWidth,
        encoding: this.encoding,
        message: isConnected ? 'Impresora conectada' : 'Impresora desconectada'
      };
    } catch (error) {
      return { connected: false, message: `Error: ${error.message}` };
    }
  }

  // Reconectar impresora
  async reconnect() {
    this.isConnected = false;
    this.printer = null;
    return await this.initialize();
  }
}

// Instancia singleton
let printerService = null;

function getThermalPrinterService() {
  if (!printerService) {
    printerService = new ThermalPrinterService();
  }
  return printerService;
}

module.exports = {
  ThermalPrinterService,
  getThermalPrinterService
};
