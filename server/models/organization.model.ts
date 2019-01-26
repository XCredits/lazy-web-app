import * as mongoose from 'mongoose';
(<any>mongoose).Promise = Promise;
const Schema = mongoose.Schema;

const OrganisationSchema = new Schema({
  organisationName: {type: String, required: true},
  website: {type: String},
  logo: {type: String},
  phoneNumber: {type: Number},
  orgUsername: {type: String, unique: true, required: true},
});

OrganisationSchema.index({organisationName: 'text'});
OrganisationSchema.index({orgUsername: 1});

module.exports = mongoose.model('Organisation', OrganisationSchema);
