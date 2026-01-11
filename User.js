const { executeQuery } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(userData) {
    this.id = userData.id;
    this.username = userData.username;
    this.password = userData.password;
    this.name = userData.name;
    this.role = userData.role;
    this.active = userData.active;
    this.created_at = userData.created_at;
    this.updated_at = userData.updated_at;
  }

  // Obtener todos los usuarios
  static async findAll() {
    try {
      const query = 'SELECT * FROM users WHERE active = TRUE ORDER BY name';
      const results = await executeQuery(query);
      return results.map(user => new User(user));
    } catch (error) {
      throw new Error(`Error obteniendo usuarios: ${error.message}`);
    }
  }

  // Buscar usuario por ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM users WHERE id = ? AND active = TRUE';
      const results = await executeQuery(query, [id]);
      return results.length > 0 ? new User(results[0]) : null;
    } catch (error) {
      throw new Error(`Error buscando usuario: ${error.message}`);
    }
  }

  // Buscar usuario por username
  static async findByUsername(username) {
    try {
      const query = 'SELECT * FROM users WHERE username = ? AND active = TRUE';
      const results = await executeQuery(query, [username]);
      return results.length > 0 ? new User(results[0]) : null;
    } catch (error) {
      throw new Error(`Error buscando usuario: ${error.message}`);
    }
  }

  // Crear nuevo usuario
  static async create(userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const query = `
        INSERT INTO users (username, password, name, role) 
        VALUES (?, ?, ?, ?)
      `;
      
      const result = await executeQuery(query, [
        userData.username,
        hashedPassword,
        userData.name,
        userData.role || 'cajero'
      ]);

      return await User.findById(result.insertId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('El nombre de usuario ya existe');
      }
      throw new Error(`Error creando usuario: ${error.message}`);
    }
  }

  // Actualizar usuario
  async update(updateData) {
    try {
      const updates = [];
      const values = [];

      if (updateData.name) {
        updates.push('name = ?');
        values.push(updateData.name);
      }

      if (updateData.role) {
        updates.push('role = ?');
        values.push(updateData.role);
      }

      if (updateData.password) {
        const hashedPassword = await bcrypt.hash(updateData.password, 10);
        updates.push('password = ?');
        values.push(hashedPassword);
      }

      if (updates.length === 0) {
        return this;
      }

      values.push(this.id);
      
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      await executeQuery(query, values);

      return await User.findById(this.id);
    } catch (error) {
      throw new Error(`Error actualizando usuario: ${error.message}`);
    }
  }

  // Eliminar usuario (soft delete)
  async delete() {
    try {
      if (this.username === 'admin') {
        throw new Error('No se puede eliminar al usuario administrador');
      }

      const query = 'UPDATE users SET active = FALSE WHERE id = ?';
      await executeQuery(query, [this.id]);
      return true;
    } catch (error) {
      throw new Error(`Error eliminando usuario: ${error.message}`);
    }
  }

  // Verificar contraseña
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  // Método para obtener datos públicos (sin contraseña)
  toPublic() {
    return {
      id: this.id,
      username: this.username,
      name: this.name,
      role: this.role,
      created_at: this.created_at
    };
  }
}

module.exports = User;
