const { executeQuery } = require('../config/database');

class Product {
  constructor(productData) {
    this.id = productData.id;
    this.name = productData.name;
    this.price = parseFloat(productData.price);
    this.active = productData.active;
    this.created_at = productData.created_at;
    this.updated_at = productData.updated_at;
  }

  // Obtener todos los productos activos
  static async findAll() {
    try {
      const query = 'SELECT * FROM products WHERE active = TRUE ORDER BY name';
      const results = await executeQuery(query);
      return results.map(product => new Product(product));
    } catch (error) {
      throw new Error(`Error obteniendo productos: ${error.message}`);
    }
  }

  // Buscar producto por ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM products WHERE id = ? AND active = TRUE';
      const results = await executeQuery(query, [id]);
      return results.length > 0 ? new Product(results[0]) : null;
    } catch (error) {
      throw new Error(`Error buscando producto: ${error.message}`);
    }
  }

  // Crear nuevo producto
  static async create(productData) {
    try {
      const query = 'INSERT INTO products (name, price) VALUES (?, ?)';
      const result = await executeQuery(query, [
        productData.name,
        parseFloat(productData.price)
      ]);

      return await Product.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error creando producto: ${error.message}`);
    }
  }

  // Actualizar producto
  async update(updateData) {
    try {
      const updates = [];
      const values = [];

      if (updateData.name) {
        updates.push('name = ?');
        values.push(updateData.name);
      }

      if (updateData.price !== undefined) {
        updates.push('price = ?');
        values.push(parseFloat(updateData.price));
      }

      if (updates.length === 0) {
        return this;
      }

      values.push(this.id);
      
      const query = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;
      await executeQuery(query, values);

      return await Product.findById(this.id);
    } catch (error) {
      throw new Error(`Error actualizando producto: ${error.message}`);
    }
  }

  // Eliminar producto (soft delete)
  async delete() {
    try {
      const query = 'UPDATE products SET active = FALSE WHERE id = ?';
      await executeQuery(query, [this.id]);
      return true;
    } catch (error) {
      throw new Error(`Error eliminando producto: ${error.message}`);
    }
  }

  // Método para obtener datos públicos
  toPublic() {
    return {
      id: this.id,
      name: this.name,
      price: this.price
    };
  }
}

module.exports = Product;
