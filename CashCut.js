const { executeQuery } = require('../config/database');

class CashCut {
  constructor(cutData) {
    this.id = cutData.id;
    this.cashier = cutData.cashier;
    this.initial_fund = parseFloat(cutData.initial_fund);
    this.final_cash = parseFloat(cutData.final_cash);
    this.voucher_total = parseFloat(cutData.voucher_total);
    this.expected_cash = parseFloat(cutData.expected_cash);
    this.difference = parseFloat(cutData.difference);
    this.total_sales = parseFloat(cutData.total_sales);
    this.total_orders = parseInt(cutData.total_orders);
    this.cash_orders = parseInt(cutData.cash_orders);
    this.card_orders = parseInt(cutData.card_orders);
    this.phone_orders = parseInt(cutData.phone_orders);
    this.counter_orders = parseInt(cutData.counter_orders);
    this.closed_by = cutData.closed_by;
    this.created_at = cutData.created_at;
  }

  // Obtener todos los cortes de caja
  static async findAll() {
    try {
      const query = 'SELECT * FROM cash_cuts ORDER BY created_at DESC';
      const results = await executeQuery(query);
      return results.map(cut => new CashCut(cut));
    } catch (error) {
      throw new Error(`Error obteniendo cortes de caja: ${error.message}`);
    }
  }

  // Obtener cortes por cajero
  static async findByCashier(cashierName) {
    try {
      const query = 'SELECT * FROM cash_cuts WHERE cashier = ? ORDER BY created_at DESC';
      const results = await executeQuery(query, [cashierName]);
      return results.map(cut => new CashCut(cut));
    } catch (error) {
      throw new Error(`Error obteniendo cortes del cajero: ${error.message}`);
    }
  }

  // Buscar corte por ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM cash_cuts WHERE id = ?';
      const results = await executeQuery(query, [id]);
      return results.length > 0 ? new CashCut(results[0]) : null;
    } catch (error) {
      throw new Error(`Error buscando corte: ${error.message}`);
    }
  }

  // Crear nuevo corte de caja
  static async create(cutData) {
    try {
      const query = `
        INSERT INTO cash_cuts (
          cashier, initial_fund, final_cash, voucher_total, 
          expected_cash, difference, total_sales, total_orders,
          cash_orders, card_orders, phone_orders, counter_orders, closed_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const result = await executeQuery(query, [
        cutData.cashier,
        parseFloat(cutData.initialFund),
        parseFloat(cutData.finalCash),
        parseFloat(cutData.voucherTotal),
        parseFloat(cutData.expectedCash),
        parseFloat(cutData.difference),
        parseFloat(cutData.totalSales),
        parseInt(cutData.totalOrders),
        parseInt(cutData.cashOrders),
        parseInt(cutData.cardOrders),
        parseInt(cutData.phoneOrders),
        parseInt(cutData.counterOrders),
        cutData.closedBy
      ]);

      return await CashCut.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error creando corte de caja: ${error.message}`);
    }
  }

  // Obtener estadísticas de cortes
  static async getStats(startDate = null, endDate = null) {
    try {
      let whereClause = '';
      const params = [];

      if (startDate && endDate) {
        whereClause = 'WHERE created_at BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }

      const query = `
        SELECT 
          COUNT(*) as total_cuts,
          SUM(total_sales) as total_sales,
          AVG(difference) as avg_difference,
          SUM(CASE WHEN difference >= 0 THEN 1 ELSE 0 END) as positive_cuts,
          SUM(CASE WHEN difference < 0 THEN 1 ELSE 0 END) as negative_cuts,
          cashier,
          SUM(total_sales) as cashier_sales
        FROM cash_cuts 
        ${whereClause}
        GROUP BY cashier
        ORDER BY cashier_sales DESC
      `;

      const results = await executeQuery(query, params);
      return results;
    } catch (error) {
      throw new Error(`Error obteniendo estadísticas: ${error.message}`);
    }
  }

  // Método para obtener datos públicos
  toPublic() {
    return {
      id: this.id,
      cashier: this.cashier,
      initialFund: this.initial_fund,
      finalCash: this.final_cash,
      voucherTotal: this.voucher_total,
      expectedCash: this.expected_cash,
      difference: this.difference,
      totalSales: this.total_sales,
      totalOrders: this.total_orders,
      cashOrders: this.cash_orders,
      cardOrders: this.card_orders,
      phoneOrders: this.phone_orders,
      counterOrders: this.counter_orders,
      closedBy: this.closed_by,
      date: this.created_at
    };
  }
}

module.exports = CashCut;
