const { executeQuery, executeTransaction } = require('../config/database');

class Order {
  constructor(orderData) {
    this.id = orderData.id;
    this.customer_name = orderData.customer_name;
    this.phone = orderData.phone;
    this.address = orderData.address;
    this.type = orderData.type;
    this.payment_method = orderData.payment_method;
    this.amount_paid = parseFloat(orderData.amount_paid || 0);
    this.change_amount = parseFloat(orderData.change_amount || 0);
    this.total = parseFloat(orderData.total);
    this.cashier = orderData.cashier;
    this.status = orderData.status;
    this.created_at = orderData.created_at;
    this.closed_at = orderData.closed_at;
    this.items = orderData.items || [];
  }

  // Obtener todas las órdenes activas
  static async findActive() {
    try {
      const ordersQuery = `
        SELECT * FROM orders 
        WHERE status = 'activa' 
        ORDER BY created_at DESC
      `;
      
      const orders = await executeQuery(ordersQuery);
      
      // Obtener items para cada orden
      for (let order of orders) {
        const itemsQuery = `
          SELECT * FROM order_items 
          WHERE order_id = ?
        `;
        order.items = await executeQuery(itemsQuery, [order.id]);
      }
      
      return orders.map(order => new Order(order));
    } catch (error) {
      throw new Error(`Error obteniendo órdenes: ${error.message}`);
    }
  }

  // Obtener órdenes por cajero
  static async findByCashier(cashierName) {
    try {
      const ordersQuery = `
        SELECT * FROM orders 
        WHERE cashier = ? AND status = 'activa'
        ORDER BY created_at DESC
      `;
      
      const orders = await executeQuery(ordersQuery, [cashierName]);
      
      // Obtener items para cada orden
      for (let order of orders) {
        const itemsQuery = `
          SELECT * FROM order_items 
          WHERE order_id = ?
        `;
        order.items = await executeQuery(itemsQuery, [order.id]);
      }
      
      return orders.map(order => new Order(order));
    } catch (error) {
      throw new Error(`Error obteniendo órdenes del cajero: ${error.message}`);
    }
  }

  // Buscar órdenes por teléfono
  static async findByPhone(phone) {
    try {
      const ordersQuery = `
        SELECT * FROM orders 
        WHERE phone LIKE ? 
        ORDER BY created_at DESC
        LIMIT 20
      `;
      
      const orders = await executeQuery(ordersQuery, [`%${phone}%`]);
      
      // Obtener items para cada orden
      for (let order of orders) {
        const itemsQuery = `
          SELECT * FROM order_items 
          WHERE order_id = ?
        `;
        order.items = await executeQuery(itemsQuery, [order.id]);
      }
      
      return orders.map(order => new Order(order));
    } catch (error) {
      throw new Error(`Error buscando órdenes por teléfono: ${error.message}`);
    }
  }

  // Crear nueva orden
  static async create(orderData) {
    try {
      const queries = [
        {
          query: `
            INSERT INTO orders (
              customer_name, phone, address, type, 
              payment_method, amount_paid, change_amount, 
              total, cashier
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          params: [
            orderData.customerName || null,
            orderData.phone || null,
            orderData.address || null,
            orderData.type,
            orderData.paymentMethod,
            parseFloat(orderData.amountPaid || 0),
            parseFloat(orderData.change || 0),
            parseFloat(orderData.total),
            orderData.cashier
          ]
        }
      ];

      const results = await executeTransaction(queries);
      const orderId = results[0].insertId;

      // Agregar items de la orden
      if (orderData.items && orderData.items.length > 0) {
        const itemQueries = orderData.items.map(item => ({
          query: `
            INSERT INTO order_items (
              order_id, product_id, product_name, 
              quantity, unit_price, total_price
            ) VALUES (?, ?, ?, ?, ?, ?)
          `,
          params: [
            orderId,
            item.id,
            item.name,
            item.quantity,
            parseFloat(item.price),
            parseFloat(item.price * item.quantity)
          ]
        }));

        await executeTransaction(itemQueries);
      }

      return await Order.findById(orderId);
    } catch (error) {
      throw new Error(`Error creando orden: ${error.message}`);
    }
  }

  // Buscar orden por ID
  static async findById(id) {
    try {
      const orderQuery = 'SELECT * FROM orders WHERE id = ?';
      const orderResults = await executeQuery(orderQuery, [id]);
      
      if (orderResults.length === 0) {
        return null;
      }

      const order = orderResults[0];
      
      // Obtener items de la orden
      const itemsQuery = 'SELECT * FROM order_items WHERE order_id = ?';
      order.items = await executeQuery(itemsQuery, [id]);
      
      return new Order(order);
    } catch (error) {
      throw new Error(`Error buscando orden: ${error.message}`);
    }
  }

  // Eliminar orden
  static async delete(id) {
    try {
      const queries = [
        {
          query: 'DELETE FROM order_items WHERE order_id = ?',
          params: [id]
        },
        {
          query: 'DELETE FROM orders WHERE id = ?',
          params: [id]
        }
      ];

      await executeTransaction(queries);
      return true;
    } catch (error) {
      throw new Error(`Error eliminando orden: ${error.message}`);
    }
  }

  // Cerrar órdenes (marcarlas como cerradas)
  static async closeOrdersByCashier(cashierName) {
    try {
      const query = `
        UPDATE orders 
        SET status = 'cerrada', closed_at = NOW() 
        WHERE cashier = ? AND status = 'activa'
      `;
      
      await executeQuery(query, [cashierName]);
      return true;
    } catch (error) {
      throw new Error(`Error cerrando órdenes: ${error.message}`);
    }
  }

  // Obtener estadísticas para corte de caja
  static async getCashReportData(cashierName = null) {
    try {
      let whereClause = "WHERE status = 'activa'";
      const params = [];

      if (cashierName && cashierName !== 'todos') {
        whereClause += " AND cashier = ?";
        params.push(cashierName);
      }

      const query = `
        SELECT 
          COUNT(*) as total_orders,
          SUM(total) as total_sales,
          SUM(CASE WHEN type = 'telefono' THEN 1 ELSE 0 END) as phone_orders,
          SUM(CASE WHEN type = 'mostrador' THEN 1 ELSE 0 END) as counter_orders,
          SUM(CASE WHEN payment_method = 'efectivo' THEN 1 ELSE 0 END) as cash_orders,
          SUM(CASE WHEN payment_method = 'tarjeta' THEN 1 ELSE 0 END) as card_orders,
          SUM(CASE WHEN payment_method = 'efectivo' THEN total ELSE 0 END) as total_cash,
          SUM(CASE WHEN payment_method = 'tarjeta' THEN total ELSE 0 END) as total_card
        FROM orders 
        ${whereClause}
      `;

      const results = await executeQuery(query, params);
      return results[0];
    } catch (error) {
      throw new Error(`Error generando reporte de caja: ${error.message}`);
    }
  }

  // Método para obtener datos públicos
  toPublic() {
    return {
      id: this.id,
      customerName: this.customer_name,
      phone: this.phone,
      address: this.address,
      type: this.type,
      paymentMethod: this.payment_method,
      amountPaid: this.amount_paid,
      change: this.change_amount,
      total: this.total,
      cashier: this.cashier,
      timestamp: this.created_at,
      items: this.items.map(item => ({
        id: item.product_id,
        name: item.product_name,
        quantity: item.quantity,
        price: parseFloat(item.unit_price)
      }))
    };
  }
}

module.exports = Order;
