import { isValidDisplayUsername, normalizeUsername } from './utils.controller';
import { Connection } from 'mongoose';
import { RSA_NO_PADDING } from 'constants';
const connectionRequest = require('../models/connection-request.model');
const connection = require('../models/connection.model');
const User = require('../models/user.model');
const Username = require('../models/username.model');
const auth = require('./jwt-auth.controller');

module.exports = function (app) {
  app.post('/api/connection/add-request', auth.jwt, addRequest);
  app.post('/api/connection/get-pending-requests', auth.jwt, getPendingRequests);
  app.post('/api/connection/get-connections', auth.jwt, getConnections);
  app.post('/api/connection/action-request', auth.jwt, actionConnectionRequest);
  app.post('/api/connection/get-pending-request-count', auth.jwt, getPendingRequestCount);
  app.post('/api/connection/get-connection-count', auth.jwt, getConnectionCount);
  app.post('/api/connection/get-sent-request', auth.jwt, getSentRequests);
  app.post('/api/connection/remove-connection', auth.jwt, removeConnection);
};


/**
 * join a connection list
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function addRequest(req, res) {
  // Save the login userId
  const userId = req.userId;
  let username = req.body.username;
  // Validate
  if (typeof username !== 'string' ||
    !isValidDisplayUsername(username)
    ) {
    return res.status(422).json({ message: 'Request failed validation' });
  }
  username = normalizeUsername(username);
  // Check if the user exist
  return Username.findOne({username})
      .then((resultUser) => {
        return User.findOne({ $and: [{ _id: resultUser.refId }, {_id: {$ne: userId} } ]})
            .then((receivingUser) => {
              return connection.findOne({
                    $or:
                      [
                         { userId: userId, connectionId: receivingUser._id, status: 'connected' },
                         { connectionId: userId, userId: receivingUser._id, status: 'connected' },
                      ]
              })
              .then((result) => {
                if ( result === null ) {
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
                            connectionReq.permissions = { category: 'default' };
                            connectionReq.active = true;
                            connectionReq.snoozed = false;
                            connectionReq.timeout = Number( process.env.CONNECTION_TIMEOUT);
                            connectionReq.sendTimestamp = new Date().getTime();
                            connectionReq.updateTimestamp = new Date().getTime();
                            return connectionReq.save()
                              .then(() => {
                                return res.send({ message: 'Success' });
                              })
                              .catch((error) => {
                                console.log(error);
                                return res.status(500)
                                  .json({ message: 'Could not save connection request.' });
                              });
                          } else {
                            return res.send({ message: 'Pending' });
                          }
                      })
                      .catch(() => {
                        return res.status(500)
                            .send('Problem finding connection requests.');
                      });
                  } else {
                      return res.send({ message: 'Connected' });
                  }
              })
              .catch(() => {
                return res.status(500)
                    .send('Problem finding connection requests.');
                });
              }).catch(() => {
                return res.status(500)
                    .send('Problem finding connection requests.');
                });
        })
        .catch(() => {
          return res.status(500)
              .send('Problem finding connection requests.');
          });

}


/**
 * return list of pending users
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function getPendingRequests(req, res) {
  // Check pending for snooze
  function checkExpiredRequests() {
    return connectionRequest.updateMany({
      receiverUserId: req.userId,
      active: { $eq: true },
      timeout: { $lt: new Date().getTime() },
      },
      {
        active: false,
        currentStatus: 'expired'
      })
      .catch((err) => {
          res.status(500).send({ message: 'Error retrieving pending requests' });
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
                })
                .catch((err) => {
                  res.status(500).send({ message: 'Error retrieving pending requests' });
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
function getConnections(req, res) {
  return connection.find(
      {
        userId: req.userId,
        status: { $eq: 'connected' },
      })
      .then((result) => {
        const senderIdArr = result.map((e => e.connectionId));
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
            })
            .catch((err) => {
              res.status(500).send({ message: 'Error retrieving confirmed connections' });
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
  const userId = req.userId;
  const action = req.body.action;
  const senderUserId = req.body.senderUserId;
  // Validate
  if (typeof action !== 'string' ||
    typeof senderUserId !== 'string') {
    return res.status(422).json({ message: 'Request failed validation' });
  }

  switch (action) {
    case 'accept':
      acceptConnectionRequest();
      break;
    case 'cancel':
      cancelConnectionRequest();
      break;
    case 'reject':
      rejectConnectionRequest();
      break;
    default:
      res.status(422).send({ message: 'Could not action connection request.' });
      break;
  }

  function acceptConnectionRequest() {
      return connectionRequest.findOneAndUpdate({
            senderUserId: senderUserId,
            receiverUserId: userId,
            active: { $eq: true }
          },
          {
            $set:
            {
              active: false,
              currentStatus: 'accepted',
              updateTimestamp: new Date().getTime(),
            }
          })
          .then((result) => {
            const _connection1 = new connection();
            _connection1.userId = userId;
            _connection1.connectionId = senderUserId;
            _connection1.status = 'connected';
            _connection1.permissions = { category: 'default' };
            _connection1.connectionRequestRef = result._id;
            return _connection1.save()
                .then(() => {
                  const _connection2 = new connection();
                  _connection2.connectionId = userId;
                  _connection2.userId = senderUserId;
                  _connection2.status = 'connected';
                  _connection2.permissions = { category: 'default' };
                  _connection2.connectionRequestRef = result._id;
                  return _connection2.save()
                      .then(() => {
                        res.send({ message: 'Request accepted' });
                      })
                      .catch((err) => {
                        res.status(500).send({ message: 'Could not save connection requests.' });
                      });
                })
                .catch(() => {
                  return res.status(500)
                      .send({ message: 'Could not save connection request.' });
                });
          })
          .catch(() => {
            res.status(500).send({ message: 'Could not save connection request.' });
          });
  }

  function cancelConnectionRequest() { // res, userId, senderUserId
    return connectionRequest.findOneAndUpdate({
          receiverUserId: senderUserId,
          senderUserId: userId,
          active: { $eq: true }
        },
        {
          $set:
          {
            active: false,
            currentStatus: 'cancelled',
            updateTimestamp: new Date().getTime(),
          }
        })
        .then(() => {
          return res.send({ message: 'Request cancelled' });
        })
        .catch(() => {
          res.status(500)
              .send({ message: 'Could not cancel connection request.' });
        });
  }

  function rejectConnectionRequest() {
    return connectionRequest.findOneAndUpdate({
          senderUserId: senderUserId,
          receiverUserId: userId,
          active: { $eq: true }
        },
        {
          $set:
          {
            active: false,
            currentStatus: 'rejected',
            updateTimestamp: new Date().getTime(),
          }
        })
        .then(() => {
          return res.send({ message: 'Request rejected' });
        })
        .catch(() => {
          res.status(500)
              .send({ message: 'Could not reject connection request.' });
        });
  }
}



/**
 * get pending request count
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function getPendingRequestCount(req, res) {
  // Save the login userId
  const userId = req.userId;
  return connectionRequest.count({
        receiverUserId: userId,
        active: { $eq: true }
      })
      .then((result) => {
        res.send({ message: result });
      })
      .catch((err) => {
        res.status(500).send({ message: 'Error retrieving pending requests count.' });
      });
}

/**
 * count connection
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function getConnectionCount(req, res) {
  // Save the login userId
  const userId = req.userId;
  return connection.count({
        userId: req.userId,
      })
      .then((result) => {
        res.send({ message: result });
      })
      .catch((err) => {
        res.status(500).send({ message: 'Error retrieving connection count.' });
      });
}

/**
 * find all requests sent
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function getSentRequests(req, res) {
  return connectionRequest.find({
        senderUserId: req.userId,
        active: { $eq: true },
      })
      .then((result) => {
        const senderIdArr = result.map((e => e.receiverUserId));
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
            })
            .catch((err) => {
              res.status(500).send({ message: 'Error retrieving pending requests.' });
            });
      })
      .catch((err) => {
        res.status(500).send({ message: 'Error retrieving pending requests' });
      });
}


/**
 * remove user connection
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function removeConnection(req, res) {
  // Save the login userId
  const userId = req.userId;
  return connection.findOneAndUpdate({
        connectionId: req.userId,
        userId: req.body.senderUserId,
      },
      {
        status: 'disconnected',
      })
      .then((result) => {
        return connection.findOneAndUpdate({
              connectionId: req.body.senderUserId,
              userId: req.userId,
            },
            {
              status: 'disconnected',
            })
            .then((returnedRes) => {
              console.log(result.connectionRequestRef);
              deleteConnectedConnection(result.connectionRequestRef);
            })
            .catch(() => {
              res.status(500)
                  .send({ message: 'Could not remove connection.' });
            });
      })
      .catch(() => {
        res.status(500)
          .send({ message: 'Could not remove connection.' });
      });

  function deleteConnectedConnection(connectionReqId) {
    return connectionRequest.findOneAndUpdate({
          _id: connectionReqId,
        },
        {
          $set:
          {
            active: false,
            currentStatus: 'disconnected',
            updateTimestamp: new Date().getTime(),
          }
        })
        .then(() => {
          return res.send({ message: 'Request rejected' });
        })
        .catch(() => {
          res.status(500)
              .send({ message: 'Could not reject connection request.' });
        });
  }
}
