import * as mongoose from 'mongoose';
(<any>mongoose).Promise = Promise;
const Schema = mongoose.Schema;

const SessionSchema = new Schema({
    userId: {type: String, required: true},
    exp: {type: Date, required: true},
    userAgent: {type: String, maxlength: 512},
    lastObserved: {type: Date, required: true},
  }
);

SessionSchema.index({userId: 1});

module.exports = mongoose.model('Session', SessionSchema);
