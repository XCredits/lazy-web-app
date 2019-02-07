import * as mongoose from 'mongoose';
(<any>mongoose).Promise = Promise;
const Schema = mongoose.Schema;

const ContactSchema = new Schema({
  userId: { type: String },
  givenName: { type: String },
  familyName: { type: String },
  email: { type: String },
  }
);


ContactSchema.index({userId: 1});

// ContactSchema.index({givenName: 1});
// ContactSchema.index({familyName: 1});
// ContactSchema.index({email: 1});

module.exports = mongoose.model('Contact', ContactSchema);
