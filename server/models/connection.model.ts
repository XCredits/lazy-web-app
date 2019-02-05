import * as mongoose from 'mongoose';
(<any>mongoose).Promise = Promise;
const Schema = mongoose.Schema;

const ConnectionSchema = new Schema({
  senderUserId: { type: String },
  receiverUserId: { type: String },
  status: { type: String },
  connectionRequestRef: { type: String },
  connectionTimeStamp: { type: Number },
}
);

ConnectionSchema.index({ senderUserId: 1 });
ConnectionSchema.index({ receiverUserId: 1 });
ConnectionSchema.index({ status: 1 });
ConnectionSchema.index({ connectionRequestRef: 1 });
ConnectionSchema.index({ connectionTimeStamp: 1 });


ConnectionSchema.methods.frontendData = function () {
  return {
    id: this._id,
    senderUserId: this.senderUserId,
    receiverUserId: this.receiverUserId,
    status: this.status,
    connectionRequestRef: this.connectionRequestRef,
    connectionTimeStamp: this.connectionTimeStamp,
  };
};

module.exports = mongoose.model('Connection', ConnectionSchema);
