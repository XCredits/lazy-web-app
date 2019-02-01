import * as mongoose from 'mongoose';
(<any>mongoose).Promise = Promise;
const Schema = mongoose.Schema;

const ConnectionSchema = new Schema({
  partAUserId: { type: String },
  partBUserId: { type: String },
  status: { type: String },
  connectionRequestRef: { type: Date },
  connectionTimeStamp: { type: Date, default: Date.now },
}
);

ConnectionSchema.index({ partAUserId: 1 });
ConnectionSchema.index({ partBUserId: 1 });
ConnectionSchema.index({ status: 1 });
ConnectionSchema.index({ connectionRequestRef: 1 });
ConnectionSchema.index({ connectionTimeStamp: 1 });


ConnectionSchema.methods.frontendData = function () {
  return {
    id: this._id,
    partAUserId: this.partAUserId,
    partBUserId: this.partBUserId,
    status: this.status,
    connectionRequestRef: this.connectionRequestRef,
    connectionTimeStamp: this.connectionTimeStamp,
  };
};

module.exports = mongoose.model('Connection', ConnectionSchema);
