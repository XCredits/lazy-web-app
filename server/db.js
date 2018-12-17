const Promise = require('bluebird');  
const DatabaseService = require('./services/database.service');
const ProductModel = require('./models/product.model'); 
const GenericItemModel = require('./models/generic-item.model'); 
const sqlite3 = require('sqlite3');
//const Promise = require('util');  
//const dbService = require('@xcredits/xcredits-core');

//console.log(dbService.dbVersionNumber);

function productDbDemo() {
    //instantiate data service object
    const databaseService = new DatabaseService('./database.sqlite3');
    //instantiate product object
    const productModel = new ProductModel(databaseService);

    //create table
    productModel.createTable()
        .then(() => {
            //create array of items to add to table
            const products = [
                {
                    name: 'Apple',
                },
                {
                    name: 'Orange',
                },
            ];
            //add array of items to table
            return new Promise.all(products.map((product) => {
                const {name} = product;
                return productModel.create(name);
            }));
        }) //get all items from table and console log items
        .then(() => productModel.getAll()
        .then((products) => {
            console.dir(products);
            return new Promise((resolve, reject) => {
                products.forEach(function(product) {
                    console.log(`Product Id: ${product.id}`);
                    console.log(`Product Name: ${product.name}`);
                });
            }); //if successful display success
            resolve('Success');     
            }) //if error console log error
            .catch((err) => {
                console.log('Error:');
                console.dir(err);
            })
        );
}

//productDbDemo();

function genericDbDemo() {
    //instantiate data service object
    const databaseService = new DatabaseService('./database.sqlite3');
    //instantiate product object
    const genericModel = new GenericItemModel(databaseService);

    //create table
    genericModel.createTable('TableA')
        .then(() => {
            //create array of items to add to table
            const items = [
                {
                    name: 'ItemA',
                },
                {
                    name: 'ItemB',
                },
            ];
            //add array of items to table
            return new Promise.all(items.map((item) => {
                const {name} = item;
                return genericModel.setFunction('TableA', name);
            }));
        }) //get all items from table and console log items
        .then(() => genericModel.getAll('TableA')
        .then((items) => {
            console.dir(items);
            return new Promise((resolve, reject) => {
                items.forEach(function(item) {
                    console.log(`Product Id: ${item.id}`);
                    console.log(`Product Name: ${item.name}`);
                });
            }); //if successful display success
            resolve('Success');     
            }) //if error console log error
            .catch((err) => {
                console.log('Error:');
                console.dir(err);
            })
        );
}

//genericDbDemo();

function genericDbLoopDemo() {
    //instantiate data service object
    const databaseService = new DatabaseService('./database.sqlite3');
    //instantiate product object
    const genericModel = new GenericItemModel(databaseService);

    // //create table
    // genericModel.createTableLoopStep1('TableC')
    //     .then(() => {
    //         genericModel.createTableLoopStep2(
    //             //'TableC', [ 'C', 'CC', 'CCC' ]);
    //             'TableC', [ {field: 'xx'} , {field: 'yy'} , {field: 'zz'} ]);
    //         console.log('Success adding columns');
    //     })
    //     .catch((err) => {
    //         console.log('Error:');
    //         console.dir(err);
    //     });

    //create table
    genericModel.createTable('TableC', [ 
        {name: 'xxxx', type: 'text'}, 
        {name: 'yyyy', type: 'text'}, 
        {name: 'zzzz', type: 'text'} ])
        .then(() => {
            console.log('Success creating table');
        })        
        .catch((err) => {
            console.log('Error:');
            console.dir(err);
        });
}

genericDbLoopDemo();


















// const dbFilePath = 'xcreditsDb.sqlite';
// var dbConnection;
// //var dbConnection = new sqlite3.Database(dbFilePath);


// //open database
// const openDatabase = (dbFilePath) => {
//     dbConnection = new sqlite3.Database(dbFilePath, (err) => {
//         if (err) {
//         console.log('From Expressjs: Could not connect to database', err);
//         } else {
//         console.log('From Expressjs: Connected to database');
//         };  
//     });
// }

// //promisify open database function
// const openDatabaseAsync = Promise.promisify(openDatabase);

// //call open database function
// openDatabaseAsync(dbFilePath) 
//     .then((msg) => console.log(`Success msg: ${msg}`))
//     .catch((err) => console.log(`Error: ${err}`));

//   //create table 
//   function createTable() {
//     //const dbConnectionRun = Promise.promisify(dbConnection.run);
//     return dbConnection.run(
//       `CREATE TABLE IF NOT EXISTS genericTable (
//         keyPath INTEGER PRIMARY KEY AUTOINCREMENT,
//         name TEXT,
//         password TEXT
//       )`,
//       function (err) {
//         if (err) {
//           console.log(`Error: ${err}`);
//         } else {
//           console.log(`Success: created table`)
//         }
//       }
//     )
//   }

//   //promisify create table function
//   const createTableAsync = Promise.promisify(createTable);

//   //delete table
//   function deleteTable(tableName) {
//     dbConnection.run(
//       `DROP TABLE IF EXISTS genericTable`,
//       [tableName],
//       function (err) {
//         if (err) {
//           console.log(`Error: ${err}`);
//         } else {
//           console.log(`Success: deleted table`)
//         }
//       }
//     )
//   }

//   //promisify delete table function
//   const deleteTableAsync = Promise.promisify(deleteTable);

//   //add entry to table
//   function setFunction(name, password) {

//     const dbConnectionRunAsync = Promise.promisify(dbConnection.run);
//     return dbConnectionRunAsync(
//         'INSERT INTO genericTable (name, password) VALUES (?, ?)',
//         [name, password])
//         .then((res) => {
//             return console.log(res);
//             console.log('Added to table');
//             //res = console.log('Add to table');
//             // res1 = res;
//             // return res1;
//         })
//         .catch((error) => {
//             retutnconsole.log(error);
//             console.log('Error adding to table');
//             //return console.log('Error adding to table');
//         });  
//   };

//   var name = 'John';
//   var password = 'password1';

//   //setFunction(name, password);
//     // .then((msg) = console.log('Success'))
//     // .catch((err) = console.log('Error'));
  
//   //promisify set Function function
//   //const setFunctionAsync = Promise.promisify(setFunction);

//   function getAllFunction() {
//     dbConnection.all(
//       `SELECT * FROM genericTable`,
//       function(err, rows) {
//         if (err) {
//           console.log(`Error: ${err}`);
//         } else {
//           console.log(`Success: got all items from table`);
//           console.log(rows);
//           // rows.array.forEach((row: any) => {
//           //   console.log(row.keyPath);
//           //   console.log(row.name);
//           //   console.log(row.obj);
//           // });
//         }
//       }
//     )
//   }

//   //promisify set Function function
//   const getAllFunctionAsync = Promise.promisify(getAllFunction);

//   function getFunction() {
//     dbConnection.all(
//       `SELECT * FROM genericTable`,
//       function(err, rows) {
//         if (err) {
//           console.log(`Error: ${err}`);
//         } else {
//           console.log(`Success: got all items from table`);
//           console.log(rows);
//           // rows.array.forEach((row: any) => {
//           //   console.log(row.keyPath);
//           //   console.log(row.name);
//           //   console.log(row.obj);
//           // });
//         }
//       }
//     )
//   }

// //createTableAsync()
//  //  .then(()=>{
//  //    return getAllFunction   });

// //var name = 'John';
// //var password = 'password1';
// //setFunction(name, password);
//     // .then((msg) = console.log('Success'))
//     // .catch((err) = console.log('Error'));

//   //getAllFunctionAsync();