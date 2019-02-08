import * as validator from 'validator';
const User = require('../models/user.model');
const Username = require('../models/username.model');
const auth = require('./jwt-auth.controller');
const {isValidDisplayUsername, normalizeUsername} =
    require('./utils.controller');

import {uploadSingleImage} from '../services/image-upload';

module.exports = function(app) {
  app.post('/api/user/save-details', auth.jwtRefreshToken, saveDetails);
  app.post('/api/user/profile-image-upload', auth.jwtRefreshToken, profileImageUpload);
};

/**
 * Change Profile details
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
        return user.save()
            .then(() => {
                return Username.findOne({refId: userId, current: true})
                    .then((response) => {
                      if (response.displayUsername === displayUsername) {
                        return res.send({message: 'Details Changed successfully'});
                      }
                      response.current = false;
                      return response.save()
                          .then(() => {
                              const usernameDocument = new Username();
                              usernameDocument.displayUsername = displayUsername;
                              usernameDocument.username = username;
                              usernameDocument.current = true;
                              usernameDocument.refId = response.refId;
                              usernameDocument.type = 'User';
                              return usernameDocument.save()
                                  .then(() => {
                                    return res.status(200).send({message: 'Details Changed successfully'});
                                  })
                                  .catch(() => {
                                    return res.status(500).send({message: 'Error in saving username'});
                                  });
                          })
                          .catch(() => {
                            return res.status(500).send({message: 'Error in changing existing username'});
                          });
                      })
                      .catch((err) => {
                        return res.status(500).send({message: 'Error in finding username'});
                      });
                    })
                    .catch(() => {
                      return res.status(500).send({message: 'Error in saving user details'});
                    });
      })
      .catch((err) => {
        return res.status(500).send({message: 'UserId not found'});
      });
}

/**
 * Upload Profile Image
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */

function profileImageUpload(req, res) {
  const userId = req.query.id;

  if (typeof userId !== 'string') {
    return res.status(422).json({message: 'Error in UserId'});
  }
  uploadSingleImage(req, res, function(err) {
    if (err) {
      return res.status(422).send({errors: [{title: 'Image Upload error', detail: err.message}]});
    }
    User.findOne({_id: userId})
        .then((user) => {
          user.profileImage = req.file.fileLocation;
          return user.save()
              .then(() => {
                return res.status(200).send({message: 'Image Uploaded Successfully'});
              })
              .catch(() => {
                return res.status(500).send({message: 'Error in uploading image'});
              });
        })
        .catch(() => {
          return res.status(500).send({message: 'UserId not found'});
        });
  });
}
