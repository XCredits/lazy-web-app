import * as mongoose from 'mongoose';
(<any>mongoose).Promise = Promise;

module.exports = mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('Mongoose connected');
    })
    .catch((err) => {
      console.log('Error in establishing MongoDB');
      console.log(err);
    });
