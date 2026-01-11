const Order = require('../models/Order');

// Obtener órdenes activas
const getActiveOrders = async (req, res) => {
  try {
    const { cashier } = req.query;
    
    let orders;
    if (cashier && cashier !== 'todos') {
      orders = await Order.findByCashier(cashier);
    } else {
      orders = await Order.findActive();
    }
    
    res.json({
      success: true,
      data: orders.map(order => order.toPublic())
    });
  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Buscar órdenes por teléfono
const searchOrdersByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    
    if (!phone || phone.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Teléfono debe tener al menos 3 dígitos'
      });
    }

    const orders = await Order.findByPhone(phone);
    
    res.json({
      success: true,
      data: orders.map(order => order.toPublic())
    });
  } catch (error) {
    console.error('Error buscando órdenes:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener orden por ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    res.json({
      success: true,
      data: order.toPublic()
    });
  } catch (error) {
    console.error('Error obteniendo orden:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Crear nueva orden
const createOrder = async (req, res) => {
  try {
    const orderData = req.body;

    // Validaciones básicas
    if (!orderData.type || !['telefono', 'mostrador'].includes(orderData.type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de orden inválido'
      });
    }

    if (!orderData.paymentMethod || !['efectivo', 'tarjeta'].includes(orderData.paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Método de pago inválido'
      });
    }

    if (!orderData.items || orderData.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La orden debe tener al menos un producto'
      });
    }

    if (!orderData.total || parseFloat(orderData.total) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El total debe ser mayor a 0'
      });
    }

    if (!orderData.cashier) {
      return res.status(400).json({
        success: false,
        message: 'Cajero es requerido'
      });
    }

    // Validaciones específicas para órdenes telefónicas
    if (orderData.type === 'telefono') {
      if (!orderData.customerName || !orderData.customerName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Nombre del cliente es requerido para órdenes telefónicas'
        });
      }
      
      if (!orderData.phone || !orderData.phone.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Teléfono es requerido para órdenes telefónicas'
        });
      }
      
      if (!orderData.address || !orderData.address.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Dirección es requerida para órdenes telefónicas'
        });
      }
    }

    // Validaciones para pago en efectivo
    if (orderData.paymentMethod === 'efectivo') {
      const amountPaid = parseFloat(orderData.amountPaid || 0);
      const total = parseFloat(orderData.total);
      
      if (amountPaid < total) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad pagada no puede ser menor al total'
        });
      }
    }

    const order = await Order.create(orderData);

    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: order.toPublic()
    });
  } catch (error) {
    console.error('Error creando orden:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Eliminar orden
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la orden existe
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    await Order.delete(id);

    res.json({
      success: true,
      message: 'Orden eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando orden:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener estadísticas para corte de caja
const getCashReportData = async (req, res) => {
  try {
    const { cashier } = req.query;
    
    const reportData = await Order.getCashReportData(cashier);
    
    res.json({
      success: true,
      data: {
        totalOrders: parseInt(reportData.total_orders || 0),
        totalSales: parseFloat(reportData.total_sales || 0),
        phoneOrders: parseInt(reportData.phone_orders || 0),
        counterOrders: parseInt(reportData.counter_orders || 0),
        cashOrders: parseInt(reportData.cash_orders || 0),
        cardOrders: parseInt(reportData.card_orders || 0),
        totalCash: parseFloat(reportData.total_cash || 0),
        totalCard: parseFloat(reportData.total_card || 0)
      }
    });
  } catch (error) {
    console.error('Error generando reporte de caja:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Cerrar órdenes por cajero
const closeOrdersByCashier = async (req, res) => {
  try {
    const { cashier } = req.body;
    
    if (!cashier) {
      return res.status(400).json({
        success: false,
        message: 'Cajero es requerido'
      });
    }

    await Order.closeOrdersByCashier(cashier);

    res.json({
      success: true,
      message: 'Órdenes cerradas exitosamente'
    });
  } catch (error) {
    console.error('Error cerrando órdenes:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getActiveOrders,
  searchOrdersByPhone,
  getOrderById,
  createOrder,
  deleteOrder,
  getCashReportData,
  closeOrdersByCashier
};
