import * as mongoose from 'mongoose';
(<any>mongoose).Promise = Promise;
const Schema = mongoose.Schema;

const ContactListContactSchema = new Schema({
  Id: { type: String }, // auto gen
  contactId: { type: String }, // contact ref id
  listId: { type: String }, // the ID from contactList
  userId: { type: String},
}
);

ContactListContactSchema.index({ contactId: 1, listId: 1 });
ContactListContactSchema.index({ listId: 1, contactId: 1 });
ContactListContactSchema.index({ userId: 1 });


module.exports = mongoose.model('ContactListContact', ContactListContactSchema);
