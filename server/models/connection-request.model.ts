import * as mongoose from 'mongoose';
(<any>mongoose).Promise = Promise;
const Schema = mongoose.Schema;

const ConnectionRequestSchema = new Schema({
  senderUserId: { type: String },
  receiverUserId: { type: String },
  sendTimeStamp: { type: Number },
  permissions: { type: Object },
  timeout: {type: Number },
  active: { type: Boolean },
  updateTimeStamp: {type: Number },
  currentStatus: {type: String },
  snoozed: {type: Boolean },
}
);

ConnectionRequestSchema.index({ senderUserId: 1 });
ConnectionRequestSchema.index({ receiverUserId: 1 });
ConnectionRequestSchema.index({ sendTimeStamp: 1 });
ConnectionRequestSchema.index({ permissions: 1 });
ConnectionRequestSchema.index({ active: 1 });
ConnectionRequestSchema.index({ timeout: 1 });
ConnectionRequestSchema.index({ updateTimeStamp: 1 });
ConnectionRequestSchema.index({ currentStatus: 1 });
ConnectionRequestSchema.index({ snoozed: 1 });


ConnectionRequestSchema.methods.frontendData = function () {
  return {
    id: this._id,
    senderUserId: this.senderUserId,
    receiverUserId: this.receiverUserId,
    sendTimeStamp: this.sendTimeStamp,
    permissions: this.permissions,
    active: this.active,
    timeout: this.timeout,
    updateTimeStamp: this.updateTimeStamp,
    currentStatus: this.currentStatus,
    snoozed: this.snoozed,
  };
};

module.exports = mongoose.model('ConnectionRequest', ConnectionRequestSchema);
