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

OrganisationSchema.methods.frontendData = function() {
  return {
    id: this._id,
    organisationName: this.organisationName,
    website: this.website,
    logo: this.logo,
    phoneNumber: this.phoneNumber,
    orgUsername: this.orgUsername,
  };
};
