const validator = require('validator');
const Product = require('../models/product-model.js');

module.exports = function(app) {
  app.post('api/product');
};

function addProduct(req, res) {
  let productName = req.body.productName;
  let price = req.body.price;
  let productType = req.body.productType;

  if(typeof productName !== string ||
  typeof price !== int
  )
  return res.status(422).json({message: 'Request failed validation'}); 
}; 