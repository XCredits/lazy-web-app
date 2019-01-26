import * as mongoose from 'mongoose';
(<any>mongoose).Promise = Promise;
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  productId: {type: String, required: true},
  productName: {type: String, required: true},
  category: {type: Array, required: true},
  description: {type: String, required: true},
  productImage: {type: String},
});

ProductSchema.index({productName: 'text'} );
ProductSchema.index({category: 1});

ProductSchema.methods.frontendData = function() {
  return {
    id: this._id,
    productName: this.productImage,
    category: this.category,
    description: this.description,
    productImage: this.productImage,
  };
};

module.exports = mongoose.model('Product', ProductSchema);

