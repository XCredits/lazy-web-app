import * as mongoose from 'mongoose';
(<any>mongoose).Promise = Promise;
const Schema = mongoose.Schema;

const ConnectionSchema = new Schema({
    senderID: {type: String},
    receiverID: {type: String},
    status: {type: String, required: true},
    requestTimeStamp: {type: Date, default: Date.now},
  }
);

ConnectionSchema.index({senderID: 1});
ConnectionSchema.index({receiverID: 1});
ConnectionSchema.index({status: 1});
ConnectionSchema.index({requestTimeStamp: 1});

ConnectionSchema.methods.frontendData = function() {
  return {
    id: this._id,
    senderID: this.senderID,
    receiverID: this.receiverID,
    requestTimeStamp: this.requestTimeStamp,
  };
};

module.exports = mongoose.model('Connections', ConnectionSchema);
