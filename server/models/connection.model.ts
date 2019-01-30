import * as mongoose from 'mongoose';
(<any>mongoose).Promise = Promise;
const Schema = mongoose.Schema;

const ConnectionSchema = new Schema({
  senderUserId: { type: String },
  receiverUserId: { type: String },
  status: { type: String },
  requestTimeStamp: { type: Date, default: Date.now },
}
);

ConnectionSchema.index({ senderUserId: 1 });
ConnectionSchema.index({ receiverUserId: 1 });
ConnectionSchema.index({ status: 1 });
ConnectionSchema.index({ requestTimeStamp: 1 });

ConnectionSchema.methods.frontendData = function () {
  return {
    id: this._id,
    senderUserId: this.senderUserId,
    receiverUserId: this.receiverUserId,
    requestTimeStamp: this.requestTimeStamp,
  };
};

module.exports = mongoose.model('Connections', ConnectionSchema);
