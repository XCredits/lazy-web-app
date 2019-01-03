import * as mongoose from 'mongoose';
(<any>mongoose).Promise = Promise;
const Schema = mongoose.Schema;

const UserStatsSchema = new Schema({
    time: {type: Date, required: true},
    count: {type: Number, default: 1},
  }
);

UserStatsSchema.index({time: 1});

module.exports = mongoose.model('UserStats', UserStatsSchema);
