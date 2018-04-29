var mongoose = require('mongoose');
var Promise = require("bluebird");
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var crypto = require('crypto');

var UserSchema = new Schema({
    givenName: {type: String},
    familyName: {type: String},
    email: {type: String, required: true},
    timeRegister: {type: Date, default: Date.now},
    passwordHash: String,
    saltRounds: String
  }
);

UserSchema.methods.createPasswordHash = function(password) {
  // https://hackernoon.com/your-node-js-authentication-tutorial-is-wrong-f1a3bf831a46
  // https://codahale.com/how-to-safely-store-a-password/
  // https://security.stackexchange.com/questions/4781/do-any-security-experts-recommend-bcrypt-for-password-storage/6415#6415

  this.saltRounds = 12;
  this.passwordHash = bcrypt.hashSync(password, this.saltRounds);
};

UserSchema.methods.checkPassword = function(password) {
  var passwordHash = bcrypt.hashSync(password, this.saltRounds);
  return passwordHash === this.passwordHash;
};

module.exports = mongoose.model('User', UserSchema);