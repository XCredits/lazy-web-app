const Promise = require('bluebird');  
const DatabaseService = require('./services/database.service');
const ProductModel = require('./models/product.model');

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

productDbDemo();
