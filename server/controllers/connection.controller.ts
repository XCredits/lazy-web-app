import { isValidDisplayUsername, normalizeUsername } from './utils.controller';
const connectionRequest = require('../models/connection-request.model');
const connection = require('../models/connection.model');
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
    return res.status(422).json({ message: 'request failed validation' });
  }
  username = normalizeUsername(username);
  // Check if the user exist
  return User.findOne({ username })
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
                connectionReq.permissions = { category: 'default' };
                connectionReq.active = true;
                connectionReq.snoozed = false;
                connectionReq.timeout = new Date().getTime() + 10 * (1000 * 60 * 60 * 24); // days
                connectionReq.sendTimeStamp = new Date().getTime();
                connectionReq.updateTimeStamp = new Date().getTime();
                return connectionReq.save()
                    .then(() => {
                      res.send({ message: 'success' });
                    })
                    .catch((error) => {
                      return res.status(500)
                          . json({ message: 'could not save connection request.' });
                    });
              } else {
                  return res.status(500)
                      .send({ message: 'pending' });
              }
            })
            .catch(() => {
              return res.status(500)
                .send('problem finding connection requests.');
            });
      })
      .catch((err) => {
        return res.status(500)
          .send({ message: 'user not found' });
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
  function checkExpiredRequests() {
    return connectionRequest.updateMany({
          receiverUserId: req.userId,
          active: { $eq: true },
          timeout: { $lt: new Date().getTime() },
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
          res.status(500).send({message: 'error retrieving pending requests'});
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
  return connectionRequest.find({ receiverUserId: req.userId, currentStatus: { $eq: 'accepted' } })
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
        res.status(500)
          .send({ message: 'error retrieving confirmed connections' });
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

  // VALIDATION@actionConnectionRequest (strings only)
  const action = req.body.actionNeeded;
  const senderUserId = req.body.senderUserId;


  switch (action) {
    case 'accept':
      acceptConnection();
      break;
    case 'cancel':
      cancelConnection();
      break;
    case 'reject':
      connectionRequest.findOneAndUpdate({
        senderUserId: senderUserId,
        receiverUserId: userId,
        active: { $eq: true }
      },
        {
          $set:
          {
            active: false,
            currentStatus: 'rejected',
            updateTimeStamp: new Date().getTime(),
          }
        })
        .then((data) => {
          if (data === null) {
            return res.status(200)
              .send({ message: 'Request ignored error' });
          }
          return res.status(200)
            .send({ message: 'Request rejected' });
        })
        .catch((err) => {
          res.status(500)
            .send({ message: err });
        });
      break;
  }

  function acceptConnection() {
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
            updateTimeStamp: new Date().getTime(),
          }
        })
        .then((result) => {
          const _connection1 = new connection();
          _connection1.senderUserId = userId;
          _connection1.receiverUserId = senderUserId;
          _connection1.status = 'connected';
          _connection1.connectionRequestRef = result._id;
          return _connection1.save()
              .then(() => {
                const _connection2 = new connection();
                _connection2.receiverUserId = userId;
                _connection2.senderUserId = senderUserId;
                _connection2.status = 'connected';
                _connection2.connectionRequestRef = result._id;
                return _connection2.save()
                    .then(() => {
                      res.send({message: 'request accepted'});
                    });
              })
              .catch(() => {
                return res.status(500)
                  .send({message: 'Could not save connection request.'});
              });
        })
        .catch(() => {
          res.status(500).send({message: 'Could not save connection request.'});
        });
  }

  function cancelConnection() { // res, userId, senderUserId
    return connectionRequest.findOneAndUpdate({
          senderUserId: senderUserId,
          receiverUserId: userId,
          active: { $eq: true }
        },
        {
          $set:
          {
            active: false,
            currentStatus: 'cancelled',
            updateTimeStamp: new Date().getTime(),
          }
        })
        .then((data) => {
          return res.status(200).send({ message: 'Request cancelled' });
        })
        .catch((err) => {
          res.status(500)
              .send({ message: 'Could not cancel connection request.' });
        });
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
    active: { $eq: true }
  })
    .then((result) => {
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
    currentStatus: { $eq: 'accepted' },
    active: { $eq: false }
  })
    .then((result) => {
      res.send({ message: result });
    });
}
