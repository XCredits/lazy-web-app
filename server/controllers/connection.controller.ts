const statsService = require('../services/stats.service.js');
import { isValidDisplayUsername, normalizeUsername } from './utils.controller';
const connectionRequest = require('../models/connection-request.model');
const User = require('../models/user.model');
const auth = require('./jwt-auth.controller');

module.exports = function (app) {
  app.post('/api/connection/add-connection-request', auth.jwt, addConnectionRequest);
  app.post('/api/connection/get-pending-connections', auth.jwt, getPendingConnections);
  app.post('/api/connection/get-confirmed-connections', auth.jwt, getConfirmedConnections);
  app.post('/api/connection/action-connection-request', auth.jwt, actionConnectionRequest);
  app.post('/api/connection/get-pending-count', auth.jwt, getPendingRequestsCount);
  app.post('/api/connection/get-confirmed-count', auth.jwt, getConfirmedConnectionsCount);
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
      return connectionRequest.findOne({ senderUserId: userId, receiverUserId: resultUserId._id })
      .then((resultConnection) => {
        if (resultConnection === null) {
          // Making new connection
          const connectionReq = new connectionRequest();
          connectionReq.senderUserId = userId;
          connectionReq.receiverUserId = resultUserId._id;
          connectionReq.permissions = 'Default';
          connectionReq.sendTimeStamp = Date.now;
          return connectionReq.save()
            .then(() => {
              res.status(200).send({ message: 'Success' });
              return statsService.increment(connectionReq)
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
 * return list of pending users
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function getPendingConnections(req, res) {
  return connectionRequest.find({ receiverUserId: req.userId, sendTimeStamp : {$ne: null} })
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
        res.status(500).send({ message: 'Error retrieving pending requests' });
      });
}


/**
 * request user connection based on status { Confirmed }
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function getConfirmedConnections(req, res) {
  return connectionRequest.find({ receiverUserId: req.userId, active: {$eq: 1} })
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
 * action connection {accept, cancel or ignore}
 * @param req request object
 * @param res response object
 */
function actionConnectionRequest(req, res) {
  // Save the login userId
  const action = req.body.actionNeeded;
  const userId = req.userId;
  let searchableUsername = req.body.receiverUsername;
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
      return connectionRequest.findOne({ senderUserId: userId, receiverUserId: resultUserId._id })
      .then(() => {
          // connection { cancel, accept or reject }
          const connectionReq = new connectionRequest();
          switch (action) {
            case 'Accepted':
              connectionReq.senderUserId = userId;
              connectionReq.receiverUserId = resultUserId._id;
              connectionReq.permissions = 'Default';
              connectionReq.active = 1;
              connectionReq.sendTimeStamp = null;
              connectionReq.acceptTimeStamp = Date.now;
              connectionReq.cancelTimeStamp = null;
              connectionReq.rejectTimeStamp = null;
            break;
            case 'Canceled':
              connectionReq.senderUserId = userId;
              connectionReq.receiverUserId = resultUserId._id;
              connectionReq.permissions = 'Default';
              connectionReq.active = 0;
              connectionReq.acceptTimeStamp = null;
              connectionReq.cancelTimeStamp = Date.now;
              connectionReq.rejectTimeStamp = null;
            break;
            case 'rejected':
              connectionReq.senderUserId = userId;
              connectionReq.receiverUserId = resultUserId._id;
              connectionReq.permissions = 'Default';
              connectionReq.active = 0;
              connectionReq.acceptTimeStamp = null;
              connectionReq.cancelTimeStamp = null;
              connectionReq.rejectTimeStamp =  Date.now;
            break;
          }
          return connectionReq.Update()
            .then(() => {
              res.status(200).send({ message: 'Success' });
              return statsService.increment(connectionReq)
                .catch((err) => {
                  return res.status(200).json({ message: err.message });
                });
            })
            .catch((error) => {
              console.log(error.message);
              return res.status(200).json({ message: error.message });
            });
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
function getPendingRequestsCount(req, res) {
  return connectionRequest.count({
    receiverUserId: req.body.userId,
    sendTimeStamp : {$ne: null},
    cancelTimeStamp : {$eq: null},
    acceptTimeStamp : {$eq: null},
    rejectTimeStamp : {$eq: null},
    active: {$ne: 0 }
  })
  .then((result) => {
    console.log(result);
    res.send({ message: result });
  });
  }

/**
 * request user connection based on status { Pending }
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function getConfirmedConnectionsCount(req, res) {
  return connectionRequest.count({
    receiverUserId: req.body.userId,
    sendTimeStamp : {$ne: null},
    cancelTimeStamp : {$eq: null},
    acceptTimeStamp : {$ne: null},
    rejectTimeStamp : {$eq: null},
    active: {$eq: 1 }
  })
  .then((result) => {
    console.log(result);
    res.send({ message: result });
  });
  }
