import * as mongoose from 'mongoose';
(<any>mongoose).Promise = Promise;
const Schema = mongoose.Schema;

const OrganizationSchema = new Schema({
  name: {type: String, required: true},
  website: {type: String},
  logo: {type: String},
  phoneNumber: {type: Number},
  username: {type: String, unique: true, required: true},
});

OrganizationSchema.index({name: 'text'});
OrganizationSchema.index({username: 1});

module.exports = mongoose.model('Organization', OrganizationSchema);
