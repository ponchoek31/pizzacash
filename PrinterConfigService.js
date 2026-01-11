const { getThermalPrinterService } = require('../services/ThermalPrinterService');

class PrinterConfigService {
  
  // Detectar impresoras disponibles
  static async detectPrinters() {
    try {
      const detected = [];
      
      // Detectar impresoras USB
      try {
        const usb = require('usb');
        const devices = usb.getDeviceList();
        
        devices.forEach(device => {
          const vendorId = device.deviceDescriptor.idVendor;
          const productId = device.deviceDescriptor.idProduct;
          
          // Vendor IDs comunes para impresoras térmicas
          const thermalPrinterVendors = [
            0x04b8, // Epson
            0x0519, // Star Micronics
            0x28e9, // Sii (Custom)
            0x154f, // Bixolon
            0x0fe6, // ICS
            0x0dd4, // Axiohm
          ];
          
          if (thermalPrinterVendors.includes(vendorId)) {
            detected.push({
              type: 'usb',
              vendorId: `0x${vendorId.toString(16).padStart(4, '0')}`,
              productId: `0x${productId.toString(16).padStart(4, '0')}`,
              description: this.getDeviceDescription(vendorId, productId)
            });
          }
        });
      } catch (error) {
        console.log('USB detection not available:', error.message);
      }

      // Detectar puertos serie
      try {
        const { SerialPort } = require('serialport');
        const ports = await SerialPort.list();
        
        ports.forEach(port => {
          if (port.path.includes('COM') || port.path.includes('tty')) {
            detected.push({
              type: 'serial',
              path: port.path,
              manufacturer: port.manufacturer || 'Unknown',
              description: `Puerto Serie: ${port.path}`
            });
          }
        });
      } catch (error) {
        console.log('Serial port detection not available:', error.message);
      }

      return detected;
    } catch (error) {
      console.error('Error detecting printers:', error);
      return [];
    }
  }

  // Obtener descripción del dispositivo
  static getDeviceDescription(vendorId, productId) {
    const devices = {
      0x04b8: {
        name: 'Epson',
        0x0202: 'TM-T20 Receipt Printer',
        0x0220: 'TM-T70 Receipt Printer',
        0x020e: 'TM-T88V Receipt Printer',
      },
      0x0519: {
        name: 'Star Micronics',
        0x0003: 'TSP100 Receipt Printer',
      },
      0x28e9: {
        name: 'Sii',
        0x0389: 'RP-E10 Receipt Printer',
      }
    };

    const vendor = devices[vendorId];
    if (vendor) {
      const product = vendor[productId] || 'Unknown Printer';
      return `${vendor.name} ${product}`;
    }
    
    return `Unknown Printer (${vendorId}:${productId})`;
  }

  // Configurar impresora automáticamente
  static async autoConfig() {
    try {
      const detected = await this.detectPrinters();
      
      if (detected.length === 0) {
        return {
          success: false,
          message: 'No se encontraron impresoras térmicas',
          config: null
        };
      }

      // Priorizar USB sobre serial
      let selectedPrinter = detected.find(p => p.type === 'usb') || detected[0];
      
      const config = {
        THERMAL_PRINTER_ENABLED: 'true',
        THERMAL_PRINTER_TYPE: selectedPrinter.type,
        THERMAL_PRINTER_INTERFACE: 'auto',
        THERMAL_PRINTER_WIDTH: '48',
        THERMAL_PRINTER_ENCODING: 'CP857'
      };

      if (selectedPrinter.type === 'usb') {
        config.THERMAL_PRINTER_VENDOR_ID = selectedPrinter.vendorId;
        config.THERMAL_PRINTER_PRODUCT_ID = selectedPrinter.productId;
      } else if (selectedPrinter.type === 'serial') {
        config.THERMAL_PRINTER_SERIAL_PORT = selectedPrinter.path;
        config.THERMAL_PRINTER_BAUDRATE = '9600';
      }

      return {
        success: true,
        message: `Impresora configurada: ${selectedPrinter.description}`,
        config: config,
        detected: detected
      };
    } catch (error) {
      return {
        success: false,
        message: `Error en configuración automática: ${error.message}`,
        config: null
      };
    }
  }

  // Test de conexión con configuración específica
  static async testConnection(config) {
    try {
      // Crear instancia temporal de la impresora con la nueva configuración
      const originalEnv = process.env;
      
      // Aplicar configuración temporal
      Object.keys(config).forEach(key => {
        process.env[key] = config[key];
      });

      const printerService = getThermalPrinterService();
      const connected = await printerService.initialize();
      
      if (connected) {
        await printerService.testPrint();
      }

      // Restaurar configuración original
      process.env = originalEnv;

      return {
        success: connected,
        message: connected ? 'Conexión exitosa' : 'No se pudo conectar'
      };
    } catch (error) {
      return {
        success: false,
        message: `Error de conexión: ${error.message}`
      };
    }
  }

  // Generar configuración para diferentes tipos de impresoras
  static generateConfig(printerType, options = {}) {
    const baseConfig = {
      THERMAL_PRINTER_ENABLED: 'true',
      THERMAL_PRINTER_TYPE: printerType,
      THERMAL_PRINTER_INTERFACE: 'auto',
      THERMAL_PRINTER_WIDTH: options.width || '48',
      THERMAL_PRINTER_ENCODING: options.encoding || 'CP857',
    };

    switch (printerType) {
      case 'usb':
        return {
          ...baseConfig,
          THERMAL_PRINTER_VENDOR_ID: options.vendorId || '0x04b8',
          THERMAL_PRINTER_PRODUCT_ID: options.productId || '0x0202'
        };

      case 'network':
        return {
          ...baseConfig,
          THERMAL_PRINTER_IP: options.ip || '192.168.1.100',
          THERMAL_PRINTER_PORT: options.port || '9100'
        };

      case 'serial':
        return {
          ...baseConfig,
          THERMAL_PRINTER_SERIAL_PORT: options.port || 'COM3',
          THERMAL_PRINTER_BAUDRATE: options.baudrate || '9600'
        };

      default:
        return baseConfig;
    }
  }

  // Obtener configuraciones predefinidas para marcas comunes
  static getPresetConfigs() {
    return {
      'epson-tm-t20': {
        name: 'Epson TM-T20',
        type: 'usb',
        config: {
          THERMAL_PRINTER_TYPE: 'usb',
          THERMAL_PRINTER_VENDOR_ID: '0x04b8',
          THERMAL_PRINTER_PRODUCT_ID: '0x0202',
          THERMAL_PRINTER_WIDTH: '48',
          THERMAL_PRINTER_ENCODING: 'CP857'
        }
      },
      'epson-tm-t88v': {
        name: 'Epson TM-T88V',
        type: 'usb',
        config: {
          THERMAL_PRINTER_TYPE: 'usb',
          THERMAL_PRINTER_VENDOR_ID: '0x04b8',
          THERMAL_PRINTER_PRODUCT_ID: '0x020e',
          THERMAL_PRINTER_WIDTH: '48',
          THERMAL_PRINTER_ENCODING: 'CP857'
        }
      },
      'star-tsp100': {
        name: 'Star TSP100',
        type: 'usb',
        config: {
          THERMAL_PRINTER_TYPE: 'usb',
          THERMAL_PRINTER_VENDOR_ID: '0x0519',
          THERMAL_PRINTER_PRODUCT_ID: '0x0003',
          THERMAL_PRINTER_WIDTH: '48',
          THERMAL_PRINTER_ENCODING: 'CP857'
        }
      },
      'network-generic': {
        name: 'Impresora de Red (Genérica)',
        type: 'network',
        config: {
          THERMAL_PRINTER_TYPE: 'network',
          THERMAL_PRINTER_IP: '192.168.1.100',
          THERMAL_PRINTER_PORT: '9100',
          THERMAL_PRINTER_WIDTH: '48',
          THERMAL_PRINTER_ENCODING: 'CP857'
        }
      },
      'serial-generic': {
        name: 'Impresora Serial (Genérica)',
        type: 'serial',
        config: {
          THERMAL_PRINTER_TYPE: 'serial',
          THERMAL_PRINTER_SERIAL_PORT: 'COM3',
          THERMAL_PRINTER_BAUDRATE: '9600',
          THERMAL_PRINTER_WIDTH: '48',
          THERMAL_PRINTER_ENCODING: 'CP857'
        }
      }
    };
  }
}

module.exports = PrinterConfigService;
