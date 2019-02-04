import * as mongoose from 'mongoose';
(<any>mongoose).Promise = Promise;
const Schema = mongoose.Schema;

const ConnectionSchema = new Schema({
  partOne: { type: String },
  partTwo: { type: String },
  status: { type: String },
  connectionRequestRef: { type: String },
  connectionTimeStamp: { type: Date, default: Date.now },
}
);

ConnectionSchema.index({ partOne: 1 });
ConnectionSchema.index({ partTwo: 1 });
ConnectionSchema.index({ status: 1 });
ConnectionSchema.index({ connectionRequestRef: 1 });
ConnectionSchema.index({ connectionTimeStamp: 1 });


ConnectionSchema.methods.frontendData = function () {
  return {
    id: this._id,
    partOne: this.partOne,
    partTwo: this.partTwo,
    status: this.status,
    connectionRequestRef: this.connectionRequestRef,
    connectionTimeStamp: this.connectionTimeStamp,
  };
};

module.exports = mongoose.model('Connection', ConnectionSchema);
