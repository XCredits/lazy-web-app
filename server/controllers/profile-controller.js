const validator = require('validator');
const User = require('../models/user.model.js');
const auth = require('./jwt-auth.controller.js');
const {isValidUsername} = require('./utils.controller.js');

module.exports = function(app) {
  app.post('/api/user/save-details', auth.jwtRefreshToken, changeProfile);
};

/**
 * Change Email, Given Name
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function changeProfile(req, res) {
  const userId = req.userId;
  const email = req.body.email;
  const givenName = req.body.givenName;
  const familyName = req.body.familyName;
  const username = req.body.username;
  if (typeof email !== 'string' ||
      typeof userId !== 'string' ||
      typeof givenName !== 'string' ||
      typeof familyName !== 'string' ||
      typeof username !== 'string' ||
      !isValidUsername(username) ||
      !validator.isEmail(email)) {
    return res.status(422).json({message: 'Request failed validation'});
  }
  return User.findOne({_id: userId})
      .then((user) => {
        user.email = email;
        user.givenName = givenName;
        user.familyName = familyName;
        user.username = username;
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
