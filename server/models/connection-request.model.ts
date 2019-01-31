import * as mongoose from 'mongoose';
(<any>mongoose).Promise = Promise;
const Schema = mongoose.Schema;

const ConnectionRequestSchema = new Schema({
  senderUserId: { type: String },
  receiverUserId: { type: String },
  sendTimeStamp: { type: Date },
  permissions: { type: String },
  active: { type: Number},
  cancelTimeStamp: {type: Date },
  acceptTimeStamp: {type: Date },
  rejectTimeStamp: {type: Date },
}
);

ConnectionRequestSchema.index({ senderUserId: 1 });
ConnectionRequestSchema.index({ receiverUserId: 1 });
ConnectionRequestSchema.index({ sendTimeStamp: 1 });
ConnectionRequestSchema.index({ permissions: 1 });
ConnectionRequestSchema.index({ active: 1 });
ConnectionRequestSchema.index({ cancelTimeStamp: 1 });
ConnectionRequestSchema.index({ acceptTimeStamp: 1 });
ConnectionRequestSchema.index({ rejectTimeStamp: 1 });


ConnectionRequestSchema.methods.frontendData = function () {
  return {
    id: this._id,
    senderUserId: this.senderUserId,
    receiverUserId: this.receiverUserId,
    sendTimeStamp: this.sendTimeStamp,
    permissions: this.permissions,
    active: this.active,
    cancelTimeStamp: this.cancelTimeStamp,
    acceptTimeStamp: this.acceptTimeStamp,
    rejectTimeStamp: this.rejectTimeStamp,
  };
};

module.exports = mongoose.model('ConnectionRequest', ConnectionRequestSchema);
