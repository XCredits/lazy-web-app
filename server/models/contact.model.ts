import * as mongoose from 'mongoose';
(<any>mongoose).Promise = Promise;
const Schema = mongoose.Schema;

const ContactSchema = new Schema({
  loginUserId: { type: String },
  givenName: { type: String },
  familyName: { type: String },
  email: { type: String },
  }
);

ContactSchema.index({givenName: 1});
ContactSchema.index({familyName: 1});
ContactSchema.index({email: 1});
ContactSchema.index({loginUserId: 1}),

ContactSchema.methods.frontendData = function() {
  return {
    id: this._id,
    loginUserId: this.givenName,
    givenName: this.givenName,
    familyName: this.familyName,
    email: this.email,
  };
};

module.exports = mongoose.model('Contact', ContactSchema);
