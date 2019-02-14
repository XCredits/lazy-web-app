import * as mongoose from 'mongoose';
(<any>mongoose).Promise = Promise;
const Schema = mongoose.Schema;

const UserOrganizationHistory = new Schema ({
  timestamp: {type: Date},
  action: {type: String},
  state: {type: Object},
});

module.exports = mongoose.model('UserOrganizationHistory', UserOrganizationHistory);
