const bluebird = require('bluebird');
const sqlite3Callback = require('sqlite3');

// import * as bluebird from 'bluebird';
// import * as sqlite3Callback from 'sqlite3';

const sqlite3 = bluebird.Promise.promisifyAll(sqlite3Callback.verbose());

module.exports = function dbSetup() {
  const connection = new sqlite3.Database('databasename');
  connection.runAsync('CREATE TABLE if not exists dummy_table (info TEXT)');
  connection.runAsync('INSERT into dummy_table(col1,col2,col3) VALUES (apple,pear,orange)');
  //const tblValue = connection.prepare("INSERT INTO dummy_table VALUES (?)");
  let data = connection.get('SELECT * FROM dummy_table');
  console.log(data);
  // for (var i = 0, , i++) {
  //   tblValue.runAsync('Table data ' + i);
  // }
};
