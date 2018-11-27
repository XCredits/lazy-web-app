class ProductSchema {
  constructor(databaseService) {
    this.databaseService = databaseService;
  } 

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT)`;
    return this.databaseService.run(sql)
  }

  create(name) {
    return this.databaseService.run(
      'INSERT INTO products (name) VALUES (?)',
      [name])
  }

  update(project) {
    const { id, name } = project
    return this.databaseService.run(
      `UPDATE products SET name = ? WHERE id = ?`,
      [name, id]
    )
  }

  delete(id) {
    return this.databaseService.run(
      `DELETE FROM products WHERE id = ?`,
      [id]
    )
  }

  getById(id) {
    return this.databaseService.get(
      `SELECT * FROM products WHERE id = ?`,
      [id])
  }

  getAll() {
    return this.databaseService.all(`SELECT * FROM products`)
  }
  
}

module.exports = ProductSchema;
