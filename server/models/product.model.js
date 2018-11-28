class ProductSchema {
  //constructor
  constructor(databaseService) {
    this.databaseService = databaseService;
  }; 

  //create table method
  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT)`;
    return this.databaseService.run(sql);
  };

  //add item to table method
  create(name) {
    return this.databaseService.run(
      'INSERT INTO products (name) VALUES (?)',
      [name]);
  };

  //update item in table
  update(project) {
    const { id, name } = project;
    return this.databaseService.run(
      `UPDATE products SET name = ? WHERE id = ?`,
      [name, id]
    );
  };

  //delete item in table
  delete(id) {
    return this.databaseService.run(
      `DELETE FROM products WHERE id = ?`,
      [id]
    );
  };

  //get item in table by id
  getById(id) {
    return this.databaseService.get(
      `SELECT * FROM products WHERE id = ?`,
      [id]);
  };

  //get all items in table
  getAll() {
    return this.databaseService.all(`SELECT * FROM products`)
  };
  
}

module.exports = ProductSchema;
