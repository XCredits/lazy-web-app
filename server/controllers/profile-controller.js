const validator = require('validator');
const User = require('../models/user.model.js');
const auth = require('../config/jwt-auth.js');
const usernameRegex = /^[a-zA-Z0-9_.-]*$/;

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
  const email = req.body.email;
  const givenName = req.body.givenName;
  const familyName = req.body.familyName;
  const username = req.body.username;
  if (typeof email !== 'string' ||
      typeof givenName !== 'string' ||
      typeof familyName !== 'string' ||
      typeof username !== 'string' ||
      !usernameRegex.test(username) ||
      !validator.isEmail(email)) {
    return res.status(422).json({message: 'Request failed validation'});
  }
  return User.findOne({_id: req.userId})
    .then((user) => {
      user.email = email;
      user.givenName = givenName;
      user.familyName = familyName;
      user.username = username;
      return user.save(() =>{
        return res.send({message: 'All Changed successfully'});
      })
      .catch((err)=> {
        console.log(err);
        return res.status(500).send({message: 'All changes failed'});
      });
    })
    .catch((err)=> {
      console.log(err);
      return res.status(500).send({message: 'userId not found'});
    });
}
