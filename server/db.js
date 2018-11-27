const Promise = require('bluebird');  
const DatabaseService = require('./services/database.service');
const ProductModel = require('./models/product.model');

function productDbDemo() {
    const databaseService = new DatabaseService('./database.sqlite3');
    const productModel = new ProductModel(databaseService);

    productModel.createTable()
        .then(() => {
            const products = [
                {
                    name: 'Apple',
                },
                {
                    name: 'Orange',
                },
            ];
            return new Promise.all(products.map((product) => {
                const {name} = product;
                return productModel.create(name);
            }))
        })
        .then(() => productModel.getAll()
        .then((products) => {
            console.dir(products);
            return new Promise((resolve, reject) => {
                products.forEach(function(product) {
                    console.log(`Product Id: ${product.id}`);
                    console.log(`Product Name: ${product.name}`);
                });
            })
            resolve('Success');     
        })
        .catch((err) => {
            console.log('Error:')
            console.dir(err);
        })
    )    
}

productDbDemo();
