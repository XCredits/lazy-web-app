import * as validation from 'validator';
import { ConsoleReporter } from 'jasmine';
const statsService = require('../services/stats.service.js');
const { isValidDisplayUsername, normalizeUsername } =
  require('./utils.controller');
const Connections = require('../models/connections.model');
const User = require('../models/user.model');
const auth = require('./jwt-auth.controller');

module.exports = function (app) {
  app.post('/api/connection/add-connection-request', auth.jwt, addConnectionRequest);
  app.post('/api/connection/get-pending-connections', auth.jwt, getPendingConnections);
  app.post('/api/connection/get-confirmed-connections', auth.jwt, getConfirmedConnections);
  app.post('/api/connection/action-connection-request', auth.jwt, actionConnectionRequested);
  app.post('/api/connection/requests/count', auth.jwt, getPendingRequestsCount);

};

/**
 * join a connection list
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function addConnectionRequest(req, res) {
  // Save the login userId
  const userId = req.userId;
  let searchableUsername = req.body.username;
  // Validate
  if (typeof searchableUsername !== 'string' ||
      !isValidDisplayUsername(searchableUsername)) {
    return res.status(422).json({message: 'Request failed validation'});
  }
  searchableUsername = normalizeUsername(searchableUsername);
  // Check if the user exist
  return User.findOne({ username: searchableUsername })
    .then((resultUserId) => {
      // Check if they have connection
      return Connections.findOne({ senderUserId: userId, receiverUserId: resultUserId._id })
      .then((resultConnection) => {
        if (resultConnection === null) {
          // Making new connection
          const _connection = new Connections();
          _connection.senderUserId = userId;
          _connection.receiverUserId = resultUserId._id;
          _connection.status = 'Pending';
          return _connection.save()
            .then(() => {
              res.status(200).send({ message: 'Success' });
              return statsService.increment(_connection)
                .catch((err) => {
                  return res.status(200).json({ message: err.message });
                });
            })
            .catch((error) => {
              console.log(error.message);
              return res.status(200).json({ message: error.message });
            });
        } else {
          return res.status(200).json({message: resultConnection.status});
        }
      });
    })
    .catch ((err) => {
      return res.status(200).send({ message: 'User not found'});
    });
}

/**
 * request user connection based on status { Pending }
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function getPendingConnections(req, res) {
  return Connections.find({ receiverUserId: req.userId, status: 'Pending' })
      .then((result) => {
        const senderIdArr = result.map((e => e.senderUserId));
        return User.find({ '_id': { '$in': senderIdArr } })
            .then((filteredResults) => {
              const resultsFiltered = filteredResults.map((x) => {
                return {
                  username: x.username,
                  givenName: x.givenName,
                  familyName: x.familyName,
                };
              });
              res.send(resultsFiltered);
            });
      })
      .catch((err) => {
        res.status(500)
          .send({ message: 'Error retrieving pending requests' });
      });
}



/**
 * request user connection based on status { Confirmed }
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function getConfirmedConnections(req, res) {
  return Connections.find({ receiverUserId: req.userId, status: 'Confirmed' })
  .then((result) => {
    const senderIdArr = result.map((e => e.senderUserId));
    return User.find({ '_id': { '$in': senderIdArr } })
        .then((filteredResults) => {
          const resultsFiltered = filteredResults.map((x) => {
            return {
              username: x.username,
              givenName: x.givenName,
              familyName: x.familyName,
            };
          });
          res.send(resultsFiltered);
        });
  })
  .catch((err) => {
    res.status(500)
      .send({ message: 'Error retrieving confirmed connections' });
  });
}

/**
 * Update user status {pending, confirmed, ignored}
 * @param {*} req request object
 * @param {*} res response object
 */
function actionConnectionRequested(req, res) {
  const status = req.body.actionNeeded;
  return Connections.updateOne(
    { '_id': req.body.userId },
    {
      $set:
      {
        'status': status
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



/**
 * request user connection based on status { Pending }
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function getPendingRequestsCount(req, res) {
  console.log('API');
  return Connections.count({ receiverUserId: req.body.userId, status: 'Pending'})
  .then((result) => {
    console.log(result);
    res.status(200).send({ message: result });

  });
  }
