const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

let ProductSchema = new Schema({
    productName: {type: String, required: true},
    price: {type: String, required: true},
    productType: {type: String, required: true},
    productId: {type: String},
  }
);

ProductSchema.index({productId: 1});
ProductSchema.index({productName: 1});
ProductSchema.index({price: 1});
ProductSchema.index({productType: 1});

module.exports = mongoose.model('Product', ProductSchema);
