const statsService = require('../services/stats.service.js');
import { isValidDisplayUsername, normalizeUsername } from './utils.controller';
import { CONNREFUSED } from 'dns';
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
  let username = req.body.username;
  // Validate
  if (typeof username !== 'string' ||
      !isValidDisplayUsername(username)) {
    return res.status(422).json({message: 'Request failed validation'});
  }
  username = normalizeUsername(username);
  // Check if the user exist
  return User.findOne({username})
      .then((receivingUser) => {
        // Check if they have connection
        return connectionRequest.findOne({
              senderUserId: userId,
              receiverUserId: receivingUser._id,
              active: { $eq: true },
            })
            .then((resultConnection) => {
              if (resultConnection === null) {
                // Making new connection
                const connectionReq = new connectionRequest();
                connectionReq.senderUserId = userId;
                connectionReq.receiverUserId = receivingUser._id;
                connectionReq.permissions = { category: 'default'};
                connectionReq.active = true;
                connectionReq.snoozed = false;
                connectionReq.timeout = new Date().getTime() + 10 * (1000 * 60 * 60 * 24); // days
                connectionReq.sendTimeStamp = new Date();
                connectionReq.updateTimeStamp = new Date();
                return connectionReq.save()
                    .then(() => {
                      res.send({ message: 'Success' });
                    })
                    .catch((error) => {
                      return res.status(500).json({ message: 'Could not save connection request.' });
                    });
              } else {
                return res.status(500).json({message: 'Pending'});
              }
            })
            .catch(() => {
              return res.status(500).send('Problem finding connection requests.');
            });
    })
    .catch ((err) => {
      return res.status(500).send({ message: 'User not found'});
    });
}

/**
 * return list of pending users
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function getPendingConnections(req, res) {

  // Check pending for snooze
  const currentDate = new Date();
  const nextTimeoutDate = new Date();
  function checkExpiredRequests() {
    return connectionRequest.updateMany({
          receiverUserId: req.userId,
          active: { $eq: true },
          timeout: { $lt: new Date().getTime()},
        },
        {
          active: false,
          currentStatus: 'expired'
        });
  }

  function findPendingConnections() {
    return connectionRequest.find({
          receiverUserId: req.userId,
          active: { $eq: true },
          snoozed: { $eq: false },
        })
        .then((result) => {
          const senderIdArr = result.map((e => e.senderUserId));
          return User.find({ '_id': { '$in': senderIdArr } })
              .then((filteredResults) => {
                const resultsFiltered = filteredResults.map((x) => {
                  return {
                    username: x.username,
                    givenName: x.givenName,
                    familyName: x.familyName,
                    userId: x._id,
                  };
                });
                res.send(resultsFiltered);
              });
        })
        .catch((err) => {
          res.status(500).send({ message: 'Error retrieving pending requests' });
        });
  }
  return checkExpiredRequests()
      .then(findPendingConnections);
}


/**
 * request user connection based on status { Confirmed }
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function getConfirmedConnections(req, res) {
  return connectionRequest.find({ receiverUserId: req.userId, currentStatus: {$eq: 'Accepted'} })
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
  const senderUserId = req.body.senderUserId;

  switch (action) {
    case 'Accept':
      connectionRequest.findOneAndUpdate({
        senderUserId: senderUserId,
        receiverUserId: userId,
        sendTimeStamp: { $eq: connectionRequest.updateTimeStamp },
        active: { $eq: false }
      },
      {
         $set:
          {
            active: true,
            currentStatus: 'Accepted',
            updateTimeStamp: new Date(),
          }
      })
        .then((data) => {
          if (data === null) {
            return res.status(200).send({ message: 'Request accept error' });
          }
          return res.status(200).send({ message: 'Request accepted' });
        })
        .catch((err) => {
          res.status(500)
            .send({ message: err });
        });
      break;
    case 'Cancel':
      connectionRequest.findOneAndUpdate({
        senderUserId: senderUserId,
        receiverUserId: userId,
        sendTimeStamp: { $eq: connectionRequest.updateTimeStamp },
        active: { $eq: false }
      },
      {
         $set:
         {
          active: false,
          currentStatus: 'Cancelled',
          updateTimeStamp: new Date(),
         }
       })
        .then((data) => {
          if (data === null) {
            return res.status(200).send({ message: 'Request cancel error' });
          }
          return res.status(200).send({ message: 'Request canceled' });
        })
        .catch((err) => {
          res.status(500)
            .send({ message: err });
        });
      break;
    case 'Reject':
      connectionRequest.findOneAndUpdate({
        senderUserId: senderUserId,
        receiverUserId: userId,
        sendTimeStamp: { $eq: connectionRequest.updateTimeStamp },
        active: { $eq: false }
      },
      {
         $set:
         {
          active: false,
          currentStatus: 'Rejected',
          updateTimeStamp: new Date(),
         }
      })
        .then((data) => {
          if (data === null) {
            return res.status(200).send({ message: 'Request ignored error' });
          }
          return res.status(200).send({ message: 'Request rejected' });
        })
        .catch((err) => {
          res.status(500)
            .send({ message: err });
        });
      break;
  }
    }



/**
 * request user connection based on status { Pending }
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function getPendingRequestsCount(req, res) {
  return connectionRequest.count({
    receiverUserId: req.userId,
    sendTimeStamp: { $eq: connectionRequest.updateTimeStamp },
    active: {$eq: false }
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
    receiverUserId: req.userId,
    currentStatus: {$eq: 'Accepted'},
  })
  .then((result) => {
    console.log(result);
    res.send({ message: result });
  });
  }
