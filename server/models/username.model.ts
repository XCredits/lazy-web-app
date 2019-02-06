import * as mongoose from 'mongoose';
(<any>mongoose).Promise = Promise;
const Schema = mongoose.Schema;

const UsernameCheckSchema = new Schema ({
  username: {type: String, unique: true },
  type: {type: String},
  refId: {type: String},
  current: {type: Boolean},
  forward: {type: Number}
});

UsernameCheckSchema.index({refId: 1, current: 1});
module.exports = mongoose.model('UsernameCheck', UsernameCheckSchema);
