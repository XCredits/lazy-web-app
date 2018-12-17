class GenericItemSchema {
  //constructor
  constructor(databaseService) {
    this.databaseService = databaseService;
  }; 

  //create table method
  createTable(tableDetails, fields = []) {
    // const sql = `
    // CREATE TABLE IF NOT EXISTS ${tableDetails.name} (
    //   id INTEGER PRIMARY KEY AUTOINCREMENT,
    //   name TEXT)`;
    
    let sql = `CREATE TABLE IF NOT EXISTS ${tableDetails.name} (${fields[0]} TEXT`
    const fieldStringArray = [];
    fields.forEach(field=>{
      fieldStringArray.push(`${field.name} ${field.type}`);
    });
    const sqlSubstring = fieldStringArray.join(', ');
    sql += sqlSubstring + ')';

    return this.databaseService.run(sql);
  };

  //create table method
  deleteTable(tableName) {
    const sql = `
    DROP TABLE IF EXISTS ${tableName}`;
    return this.databaseService.run(sql);
  };

  //add item to table method
  setFunction(tableName, name) {
    return this.databaseService.run(
      `INSERT INTO ${tableName} (name) VALUES (?)`,
      [name]);
  };

  //update item in table
  updateFunction(tableName, item) {
    const { id, name } = item;
    return this.databaseService.run(
      `UPDATE ${tableName} SET name = ? WHERE id = ?`,
      [name, id]
    );
  };

  //delete item in table
  deleteFunction(tableName, id) {
    return this.databaseService.run(
      `DELETE FROM ${tableName} WHERE id = ?`,
      [id]
    );
  };

  //get item in table by id
  getFunction(tableName, id) {
    return this.databaseService.get(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      [id]);
  };

  //UNFINISHED
  //get item in table by id
  getRangeFunction(tableName, id) {
    return this.databaseService.get(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      [id]);
  };

  //get all items in table
  getAll(tableName) {
    return this.databaseService.all(`SELECT * FROM ${tableName}`)
  };
  
}

module.exports = GenericItemSchema;