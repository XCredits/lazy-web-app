import * as mongoose from 'mongoose';
(<any>mongoose).Promise = Promise;
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const {normalizeUsername} = require('../controllers/utils.controller.js');

const ContactSchema = new Schema({
    givenName: {type: String},
    familyName: {type: String},
    email: {type: String},
  }
);

ContactSchema.index({username: 1});
ContactSchema.index({displayUsername: 1});
ContactSchema.index({email: 1});


ContactSchema.methods.createPasswordHash = function(password) {
  // https://hackernoon.com/your-node-js-authentication-tutorial-is-wrong-f1a3bf831a46
  // https://codahale.com/how-to-safely-store-a-password/
  // https://security.stackexchange.com/questions/4781/do-any-security-experts-recommend-bcrypt-for-password-storage/6415#6415

  this.saltRounds = 12;
  this.passwordHash = bcrypt.hashSync(password, this.saltRounds);
};

ContactSchema.methods.checkPassword = function(password) {
  return bcrypt.compareSync(password, this.passwordHash);
};

/**
 * removes secret data we don't want to send to the front-end
 * @return {*}
 */
ContactSchema.methods.frontendData = function() {
  return {
    id: this._id,
    givenName: this.givenName,
    familyName: this.familyName,
    email: this.email,
  };
};

module.exports = mongoose.model('Contact', ContactSchema);
