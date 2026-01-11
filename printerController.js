const { getThermalPrinterService } = require('../services/ThermalPrinterService');
const Order = require('../models/Order');
const CashCut = require('../models/CashCut');

// Obtener estado de la impresora
const getPrinterStatus = async (req, res) => {
  try {
    const printerService = getThermalPrinterService();
    const status = await printerService.getStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error obteniendo estado de impresora:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado de la impresora',
      error: error.message
    });
  }
};

// Reconectar impresora
const reconnectPrinter = async (req, res) => {
  try {
    const printerService = getThermalPrinterService();
    const connected = await printerService.reconnect();
    
    res.json({
      success: true,
      message: connected ? 'Impresora reconectada exitosamente' : 'No se pudo conectar la impresora',
      data: { connected }
    });
  } catch (error) {
    console.error('Error reconectando impresora:', error);
    res.status(500).json({
      success: false,
      message: 'Error al reconectar impresora',
      error: error.message
    });
  }
};

// Imprimir ticket de orden
const printOrderTicket = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Buscar la orden en la base de datos
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    const printerService = getThermalPrinterService();
    const result = await printerService.printOrderTicket(order.toPublic());
    
    res.json({
      success: result.success,
      message: result.message,
      data: result.data || null
    });
  } catch (error) {
    console.error('Error imprimiendo ticket de orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al imprimir ticket',
      error: error.message
    });
  }
};

// Imprimir corte de caja
const printCashCutReport = async (req, res) => {
  try {
    const { cutId } = req.params;
    
    // Buscar el corte en la base de datos
    const cut = await CashCut.findById(cutId);
    if (!cut) {
      return res.status(404).json({
        success: false,
        message: 'Corte de caja no encontrado'
      });
    }

    const printerService = getThermalPrinterService();
    const result = await printerService.printCashCutReport(cut.toPublic());
    
    res.json({
      success: result.success,
      message: result.message,
      data: result.data || null
    });
  } catch (error) {
    console.error('Error imprimiendo corte de caja:', error);
    res.status(500).json({
      success: false,
      message: 'Error al imprimir corte de caja',
      error: error.message
    });
  }
};

// Test de impresión
const testPrint = async (req, res) => {
  try {
    const printerService = getThermalPrinterService();
    await printerService.testPrint();
    
    res.json({
      success: true,
      message: 'Test de impresión enviado'
    });
  } catch (error) {
    console.error('Error en test de impresión:', error);
    res.status(500).json({
      success: false,
      message: 'Error en test de impresión',
      error: error.message
    });
  }
};

// Imprimir ticket personalizado
const printCustomTicket = async (req, res) => {
  try {
    const { orderData } = req.body;
    
    if (!orderData) {
      return res.status(400).json({
        success: false,
        message: 'Datos de la orden son requeridos'
      });
    }

    const printerService = getThermalPrinterService();
    const result = await printerService.printOrderTicket(orderData);
    
    res.json({
      success: result.success,
      message: result.message,
      data: result.data || null
    });
  } catch (error) {
    console.error('Error imprimiendo ticket personalizado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al imprimir ticket',
      error: error.message
    });
  }
};

// Imprimir corte de caja personalizado
const printCustomCashCut = async (req, res) => {
  try {
    const { cutData } = req.body;
    
    if (!cutData) {
      return res.status(400).json({
        success: false,
        message: 'Datos del corte son requeridos'
      });
    }

    const printerService = getThermalPrinterService();
    const result = await printerService.printCashCutReport(cutData);
    
    res.json({
      success: result.success,
      message: result.message,
      data: result.data || null
    });
  } catch (error) {
    console.error('Error imprimiendo corte personalizado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al imprimir corte de caja',
      error: error.message
    });
  }
};

module.exports = {
  getPrinterStatus,
  reconnectPrinter,
  printOrderTicket,
  printCashCutReport,
  testPrint,
  printCustomTicket,
  printCustomCashCut
};
