import * as mongoose from 'mongoose';
(<any>mongoose).Promise = Promise;
const Schema = mongoose.Schema;

const UsernameSchema = new Schema ({
  username: {type: String},
  displayUsername: {type: String, unique: true},
  type: {type: String},
  refId: {type: String},
  current: {type: Boolean},
  forward: {type: Date}
});

UsernameSchema.index({refId: 1, current: 1});
module.exports = mongoose.model('Username', UsernameSchema);
