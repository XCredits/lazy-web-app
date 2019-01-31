import * as validator from 'validator';
const User = require('../models/user.model');
const auth = require('./jwt-auth.controller');
import { isValidDisplayUsername, normalizeUsername } from './utils.controller';

module.exports = function(app) {
  app.post('/api/user/save-details', auth.jwtRefreshToken, saveDetails);
};

/**
 * Change Email, Given Name
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function saveDetails(req, res) {
  const userId = req.userId;
  const email = req.body.email;
  const givenName = req.body.givenName;
  const familyName = req.body.familyName;
  const displayUsername = req.body.username;
  if (typeof email !== 'string' ||
      typeof userId !== 'string' ||
      typeof givenName !== 'string' ||
      typeof familyName !== 'string' ||
      typeof displayUsername !== 'string' ||
      !isValidDisplayUsername(displayUsername) ||
      !validator.isEmail(email)) {
    return res.status(422).json({message: 'Request failed validation'});
  }
  const username = normalizeUsername(displayUsername);
  return User.findOne({_id: userId})
      .then((user) => {
        user.email = email;
        user.givenName = givenName;
        user.familyName = familyName;
        user.username = username;
        user.displayUsername = displayUsername;
        return user.save()
            .then(() => {
              return res.send({message: 'Details Changed successfully'});
            })
            .catch((err) => {
              return res.status(500).send({message: 'Error in saving changes'});
            });
      })
      .catch((err) => {
        return res.status(500).send({message: 'UserId not found'});
      });
}
