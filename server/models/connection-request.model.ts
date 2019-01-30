import * as mongoose from 'mongoose';
(<any>mongoose).Promise = Promise;
const Schema = mongoose.Schema;

const ConnectionRequestSchema = new Schema({
  senderUserId: { type: String },
  receiverUserId: { type: String },
  status: { type: String },
  requestTimeStamp: { type: Date, default: Date.now },
}
);

ConnectionRequestSchema.index({ senderUserId: 1 });
ConnectionRequestSchema.index({ receiverUserId: 1 });
ConnectionRequestSchema.index({ status: 1 });
ConnectionRequestSchema.index({ requestTimeStamp: 1 });

ConnectionRequestSchema.methods.frontendData = function () {
  return {
    id: this._id,
    senderUserId: this.senderUserId,
    receiverUserId: this.receiverUserId,
    requestTimeStamp: this.requestTimeStamp,
  };
};

module.exports = mongoose.model('Connections', ConnectionRequestSchema);
