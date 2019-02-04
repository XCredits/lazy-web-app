import * as mongoose from 'mongoose';
(<any>mongoose).Promise = Promise;
const Schema = mongoose.Schema;

const ContactSchema = new Schema({
    givenName: {type: String},
    familyName: {type: String},
    email: {type: String},
  }
);

ContactSchema.index({username: 1});
ContactSchema.index({displayUsername: 1});
ContactSchema.index({email: 1});


ContactSchema.methods.frontendData = function() {
  return {
    id: this._id,
    givenName: this.givenName,
    familyName: this.familyName,
    email: this.email,
  };
};

module.exports = mongoose.model('Contact', ContactSchema);
