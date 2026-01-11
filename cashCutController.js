const CashCut = require('../models/CashCut');
const Order = require('../models/Order');

// Obtener todos los cortes de caja
const getCashCuts = async (req, res) => {
  try {
    const { cashier } = req.query;
    
    let cuts;
    if (cashier && cashier !== 'todos') {
      cuts = await CashCut.findByCashier(cashier);
    } else {
      cuts = await CashCut.findAll();
    }
    
    res.json({
      success: true,
      data: cuts.map(cut => cut.toPublic())
    });
  } catch (error) {
    console.error('Error obteniendo cortes de caja:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener corte por ID
const getCashCutById = async (req, res) => {
  try {
    const { id } = req.params;
    const cut = await CashCut.findById(id);
    
    if (!cut) {
      return res.status(404).json({
        success: false,
        message: 'Corte de caja no encontrado'
      });
    }

    res.json({
      success: true,
      data: cut.toPublic()
    });
  } catch (error) {
    console.error('Error obteniendo corte de caja:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Crear nuevo corte de caja
const createCashCut = async (req, res) => {
  try {
    const {
      cashier,
      initialFund,
      finalCash,
      voucherTotal,
      closedBy
    } = req.body;

    // Validaciones básicas
    if (!cashier || !closedBy) {
      return res.status(400).json({
        success: false,
        message: 'Cajero y quien cierra son requeridos'
      });
    }

    if (isNaN(initialFund) || isNaN(finalCash) || isNaN(voucherTotal)) {
      return res.status(400).json({
        success: false,
        message: 'Los montos deben ser números válidos'
      });
    }

    if (parseFloat(initialFund) < 0 || parseFloat(finalCash) < 0 || parseFloat(voucherTotal) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Los montos no pueden ser negativos'
      });
    }

    // Obtener datos del reporte de ventas
    const reportData = await Order.getCashReportData(cashier);
    
    // Calcular valores
    const expectedCash = parseFloat(initialFund) + parseFloat(reportData.total_cash || 0);
    const difference = parseFloat(finalCash) - expectedCash;

    // Crear el corte
    const cutData = {
      cashier,
      initialFund: parseFloat(initialFund),
      finalCash: parseFloat(finalCash),
      voucherTotal: parseFloat(voucherTotal),
      expectedCash,
      difference,
      totalSales: parseFloat(reportData.total_sales || 0),
      totalOrders: parseInt(reportData.total_orders || 0),
      cashOrders: parseInt(reportData.cash_orders || 0),
      cardOrders: parseInt(reportData.card_orders || 0),
      phoneOrders: parseInt(reportData.phone_orders || 0),
      counterOrders: parseInt(reportData.counter_orders || 0),
      closedBy
    };

    const cashCut = await CashCut.create(cutData);

    // Cerrar las órdenes relacionadas
    if (cashier === 'todos') {
      // Cerrar todas las órdenes activas
      await Order.closeOrdersByCashier(''); // Pasar string vacío para cerrar todas
    } else {
      await Order.closeOrdersByCashier(cashier);
    }

    res.status(201).json({
      success: true,
      message: 'Corte de caja creado exitosamente',
      data: cashCut.toPublic()
    });
  } catch (error) {
    console.error('Error creando corte de caja:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener estadísticas de cortes
const getCashCutStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const stats = await CashCut.getStats(startDate, endDate);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getCashCuts,
  getCashCutById,
  createCashCut,
  getCashCutStats
};
