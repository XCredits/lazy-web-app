import * as mongoose from 'mongoose';
(<any>mongoose).Promise = Promise;
const Schema = mongoose.Schema;

const ContactGroupContactSchema = new Schema({
  contactId: { type: String },
  groupId: { type: String },
  userId: { type: String},
}
);

ContactGroupContactSchema.index({ contactId: 1, groupId: 1 });
ContactGroupContactSchema.index({ groupId: 1, contactId: 1 });
ContactGroupContactSchema.index({ userId: 1 });


module.exports = mongoose.model('ContactGroupContact', ContactGroupContactSchema);
