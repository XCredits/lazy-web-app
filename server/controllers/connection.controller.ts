import * as validator from 'validator';
const MailingList = require('../models/mailing-list.model.js');
const emailService = require('../services/email.service.js');
const statsService = require('../services/stats.service.js');
const { isValidDisplayUsername, normalizeUsername } =
  require('./utils.controller');
const Connections = require('../models/connections.model');
const User = require('../models/user.model');
const auth = require('./jwt-auth.controller');

module.exports = function (app) {
  app.post('/api/connection/find-userId', auth.jwt, requestUserId); // findUserId
  app.post('/api/connection/check-user-status', auth.jwt, requestUserStatus); // SAME NAME
  app.post('/api/connection/add-connection-request', auth.jwt, addConnectionRequest);
  app.post('/api/connection/get-connection-confirmed', auth.jwt, requestConfirmedUserConnections);
  app.post('/api/connection/get-connection-request', auth.jwt, requestPendingUserConnections);
  app.post('/api/connection/action-connection-request', auth.jwt, actionConnectionRequested);

};

/**
 * join a connection list
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function addConnectionRequest(req, res) {
  console.log('received id is ' + req.body.userId + '   ' + req.body.username);
  // Save the login userId
  const userId = req.userId;
  let searchableUsername = req.body.username;
  // Validate
  if (typeof searchableUsername !== 'string' ||
      !isValidDisplayUsername(searchableUsername)) {
    return res.status(422).json({message: 'Request failed validation'});
  }
  searchableUsername = normalizeUsername(searchableUsername);
  console.log('searchableUsername' + searchableUsername);

  // Check if the user exist
  return User.findOne({ username: searchableUsername })
    .then((resultUserId) => {
      console.log(' find one id ****' + resultUserId._id);
      // Check if they have connection
      return Connections.findOne({ senderUserId: userId, receiverUserId: resultUserId._id })
      .then((resultConnection) => {
        if (resultConnection === null) {
          console.log(' find one id ' + resultUserId);

          console.log('resultConnection is null' );

          // Making new connection
          const _connection = new Connections();
          _connection.senderUserId = userId;
          _connection.receiverUserId = resultUserId._id;
          _connection.status = 'Pending';
          return _connection.save()
            .then(() => {
              res.status(200).send({ message: 'Success..' });
              return statsService.increment(_connection)
                .catch((err) => {
                  console.log(err.message);
                  console.log('Error in the connection service');
                });
            })
            .catch((error) => {
              console.log(error.message);
              return res.status(500).json({ message: error.message });
            });
        } else {
          return res.status(200).json({message: resultConnection.status});
        }
      });
    })
    .catch ((err) => {
      return res.status(500).send({ message: 'User not found'});
    });
}


/**
 * find userId by username
 * @param {*} req request object
 * @param {*} res response object
 * @returns {*}
 */
function requestUserId(req, res) {
  const _username = normalizeUsername(req.body.username);
  if (typeof _username !== 'string') {
    return res.status(422).json({ message: 'Request failed validation' });
  }
  return User.findOne({ username: _username })
    .then((result) => {
      const resultsFiltered =  {
          _id: result._id,
          username: result.username,
        };
      res.send(resultsFiltered);
    })
    .catch((err) => {
      return res.status(500).send({ message: 'UserId not found...' });
    });
}



/**
 * returns user status
 * @param {*} req request object
 * @param {*} res response object
 * @returns {*}
 */
function requestUserStatus(req, res) {
  // req.userId
  Connections.find({ senderUserId: req.$$$$$$$body.senderUserId, receiverUserId: req.body.receiverUserId })
    .then((result) => {
      const resultsFiltered = result.map((x) => {
        return {
          senderUserId: x.senderUserId,
          receiverUserId: x.receiverUserId,
          status: x.status,
          requestTimeStamp: x.requestTimeStamp
        };
      });
      res.send(resultsFiltered);
    })
    .catch((err) => {
      res.status(500)
        .send({ message: 'Error retrieving users from contacts database' });
    });
}


/**
 * request user connection based on status { Pending }
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function requestPendingUserConnections(req, res) {
  status = req.body.status; // PROBLEM

  // VALIDATION !!!!

  Connections.find({ receiverUserId: req.userId, status: req.body.status }) // PROBLEM
      .then((result) => {
        const senderIdArr = result.map((e => e.receiverUserId));
        return User.find({ '_id': { '$in': senderIdArr } })
            .then((filteredResults) => {
              const resultsFiltered = filteredResults.map((x) => {
                return {
                  username: x.username,
                  senderUserId: result.senderUserId,
                  firstName: x.firstName,
                  lastName: x.lastName,
                };
              });
              res.send(resultsFiltered);
            });
      })
      .catch((err) => {
        res.status(500)
          .send({ message: 'Error retrieving users from contacts database' });
      });
}



/**
 * request user connection based on status { Confirmed }
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function requestConfirmedUserConnections(req, res) {
  status = req.body.status;
  Connections.find({ receiverUserId: req.userId, status: req.body.status })
    .then((result) => {
      const senderIdArr = result.map((e => e.receiverUserId));
      return User.find({ '_id': { '$in': senderIdArr } })
        .then((filteredResults) => {
          const resultsFiltered = filteredResults.map((x) => {
            return {
              username: x.username,
              senderUserId: x.senderUserId,
              firstName: x.firstName,
              lastName: x.lastName,
            };
          });
          res.send(resultsFiltered);
        });
    })
    .catch((err) => {
      res.status(500)
        .send({ message: 'Error retrieving users from contacts database' });
    });
}

/**
 * Update user status {pending, confirmed, ignored}
 * @param {*} req request object
 * @param {*} res response object
 */
function actionConnectionRequested(req, res) {
  status = req.body.actionNeeded;
  return Connections.updateOne(
    { '_id': req.body.userId },
    {
      $set:
      {
        'status': req.body.status
      }
    }
  ).then((result) => {
    res.status(200).send({ message: 'Update success' });
  })
    .catch((err) => {
      res.status(500)
        .send({ message: 'Error updating user status from connection database' });
    });
}


