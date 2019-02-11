import * as mongoose from 'mongoose';
(<any>mongoose).Promise = Promise;
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

  const promises = [User.findOne({_id: userId}),
    Username.findOne({username: username}),
    Username.findOne({refId: userId, current: true})];

  Promise.all(promises)
      .then(([user, requestedUsername, currentUsername]) => {
        user.email = email;
        user.givenName = givenName;
        user.familyName = familyName;
        let saveCurrentUsername = false, saveRequestedUsername = false,
            saveNewUsername = false;
        let newUsername;
        if (requestedUsername) {
          if (requestedUsername.refId !== userId) {
            return res.status(401).send({message: 'Username belongs to another user'});
          } else {
            if (requestedUsername.username === username) {
              if (requestedUsername.displayUsername !== displayUsername) {
                requestedUsername.displayUsername = displayUsername;

                saveRequestedUsername = true;
              }
            } else {
              currentUsername.current = false;

              requestedUsername.current = true;
              requestedUsername.displayUsername = displayUsername;

              saveCurrentUsername = true;
              saveRequestedUsername = true;
            }
          }
        } else {
          newUsername = new Username();
          newUsername.displayUsername = displayUsername;
          newUsername.username = username;
          newUsername.current = true;
          newUsername.refId = userId;
          newUsername.type = 'user';

          currentUsername.current = false;

          saveNewUsername = true;
          saveCurrentUsername = true;
        }

        // https://mongoosejs.com/docs/transactions.html
        let session;
        mongoose.startSession()
            .then((_session) => {
              session = _session;
              const promises2 = [user.save({ session: session })];
              if (saveCurrentUsername) {
                promises2.push(currentUsername.save());
              }
              if (saveRequestedUsername) {
                promises2.push(requestedUsername.save());
              }
              if (saveNewUsername) {
                promises2.push(newUsername.save());
              }
              return Promise.all(promises2);
            })
            .then(() => session.commitTransaction())
            .then(() => {
              res.send({message: 'Details changed successfully'});
            })
            .catch(() => {
              res.status(500).send({message: 'Error in saving user details'});
              return session.abortTransaction();
            });
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
