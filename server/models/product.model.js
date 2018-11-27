class ProductSchema {
  constructor(dao) {
    this.dao = dao;
  } 

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT)`;
    return this.dao.run(sql)
  }

  create(name) {
    return this.dao.run(
      'INSERT INTO products (name) VALUES (?)',
      [name])
  }

  update(project) {
    const { id, name } = project
    return this.dao.run(
      `UPDATE products SET name = ? WHERE id = ?`,
      [name, id]
    )
  }

  delete(id) {
    return this.dao.run(
      `DELETE FROM products WHERE id = ?`,
      [id]
    )
  }

  getById(id) {
    return this.dao.get(
      `SELECT * FROM products WHERE id = ?`,
      [id])
  }

  getAll() {
    return this.dao.all(`SELECT * FROM products`)
  }
  
}

module.exports = ProductSchema;
