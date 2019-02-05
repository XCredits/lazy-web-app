import * as mongoose from 'mongoose';
(<any>mongoose).Promise = Promise;
const Schema = mongoose.Schema;

const OrganizationSchema = new Schema({
  name: {type: String, required: true},
  website: {type: String},
  logo: {type: String},
  phoneNumber: {type: String},
  username: {type: String, unique: true, required: true},
  userCount: {type: Number},
});

OrganizationSchema.index({name: 'text'});
OrganizationSchema.index({username: 1});

OrganizationSchema.methods.frontendData = function() {
  return {
    id: this._id,
    name: this.name,
    website: this.website,
    username: this.username,
    logo: this.logo,
    phoneNumber: this.phoneNumber,
    userCount: this.userCount,
  };
};

module.exports = mongoose.model('Organization', OrganizationSchema);
