import * as validator from 'validator';
const MailingList = require('../models/mailing-list.model.js');
const emailService = require('../services/email.service.js');
const statsService = require('../services/stats.service.js');
const {isValidDisplayUsername, normalizeUsername} =
    require('./utils.controller');
const Connections = require('../models/connections.model');
const User = require('../models/user.model');

module.exports = function(app) {
  app.post('/api/connection/add-connection-request', addConnectionRequest);
  app.post('/api/connection/get-user-request', requestUserID);
  app.post('/api/connection/check-user-status', requestUserStatus);
  app.post('/api/connection/get-pending-request', requestUserPendingConnections);
  app.post('/api/connection/get-confirmed-request', requestUserConfirmedConnections);
  app.post('/api/user/get-username', requestUsername);
  app.post('/api/connection/ignore-connection-request', ignoreConnectionRequest);
  app.post('/api/connection/approve-connection-request', approveConnectionRequest);

};

/**
 * join a contact list
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function addConnectionRequest(req, res) {
  console.log('joining connection request ');
  const senderUserId = req.body.senderUserId;
  const receiverUserId = req.body.receiverUserId;

  const _connection = new Connections();
  _connection.senderUserId = senderUserId;
  _connection.receiverUserId = receiverUserId;
  _connection.status = 'Pending';
  return _connection.save()
      .then((result) => {
        res.status(200).send({message: 'Success'});
        return statsService.increment(_connection)
            .catch((err) => {
              console.log('Error in the connection request service');
            });
      })
      .catch((error) => {
        console.log('Error');
        console.log(error.message);
        return res.status(500).json({message: error.message});
      });
}


/**
 * returns the user details
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function requestUsername(req, res) {
  const _userID = req.body.userID;
  if ( typeof _userID !== 'string') {
    return res.status(422).json({message: 'Request failed validation'});
  }
  User.find({_id: _userID})
      .then((result) => {
        const resultsFiltered = result.map((x) => {
          console.log('the user name is ' + x.familyName);
          return {givenName : x.givenName, familyName: x.familyName};
        });
        res.send(resultsFiltered);
      })
      .catch((err) => {
        return res.status(500).send({message: 'UserId not found...'});
      });
}


/**
 * find userID by username
 * @param {*} req request object
 * @param {*} res response object
 * @returns {*}
 */
function requestUserID(req, res) {
  const _username =  normalizeUsername(req.body.username);
  if ( typeof _username !== 'string') {
    return res.status(422).json({message: 'Request failed validation'});
  }
  User.find({username: _username})
      .then((result) => {
        const resultsFiltered = result.map((x) => {
          return {_id: x._id, username: x.username, givenName: x.givenName, familyName: x.familyName};
        });
        res.send(resultsFiltered);
      })
      .catch((err) => {
        return res.status(500).send({message: 'UserId not found...'});
      });
}



/**
 * returns user status
 * @param {*} req request object
 * @param {*} res response object
 * @returns {*}
 */
function requestUserStatus(req, res) {

  Connections.find({senderUserId: req.body.senderUserId, receiverUserId: req.body.receiverUserId})
  .then((result) => {
    console.log('==============' + result);
    const resultsFiltered = result.map((x) => {
    return {senderUserId: x.senderUserId, receiverUserId: x.receiverUserId, status : x.status, requestTimeStamp : x.requestTimeStamp};
  });
  res.send(resultsFiltered);
})
  .catch((err) => {
    res.status(500)
        .send({message: 'Error retrieving users from contacts database'});
  });
}



/**
 * join a contact list
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function requestUserConfirmedConnections (req, res) {
  Connections.find({receiverUserId: req.userId , status: 'Confirmed'})
  .then((result) => {
    console.log('==============' + result);
    const resultsFiltered = result.map((x) => {
    return {senderUserId: x.senderUserId, receiverUserId: x.receiverUserId, requestTimeStamp : x.requestTimeStamp};
  });
  res.send(resultsFiltered);
})
  .catch((err) => {
    res.status(500)
        .send({message: 'Error retrieving users from contacts database'});
  });
}


/**
 * join a contact list
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function requestUserPendingConnections (req, res) {
  // Connections.count
  Connections.find({receiverUserId: req.body.userID , status: 'Pending'})
  .then((result) => {
    console.log('==============' + result);
    const resultsFiltered = result.map((x) => {
    return {senderUserId: x.senderUserId, receiverUserId: x.receiverUserId, requestTimeStamp : x.requestTimeStamp};
  });
  res.send(resultsFiltered);
})
  .catch((err) => {
    res.status(500)
        .send({message: 'Error retrieving users from contacts database'});
  });
}



/**
 * join a contact list
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function ignoreConnectionRequest (req, res) {
  Connections.find({receiverUserId: req.body.userID , status: 'Pending'})
  .then((result) => {
    console.log('==============' + result);
    const resultsFiltered = result.map((x) => {
    return {senderUserId: x.senderUserId, receiverUserId: x.receiverUserId, requestTimeStamp : x.requestTimeStamp};
  });
  res.send(resultsFiltered);
})
  .catch((err) => {
    res.status(500)
        .send({message: 'Error retrieving users from contacts database'});
  });
}

/**
 * join a contact list
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function approveConnectionRequest (req, res) {
  Connections.find({receiverUserId: req.body.userID , status: 'Pending'})
  .then((result) => {
    console.log('==============' + result);
    const resultsFiltered = result.map((x) => {
    return {senderUserId: x.senderUserId, receiverUserId: x.receiverUserId, requestTimeStamp : x.requestTimeStamp};
  });
  res.send(resultsFiltered);
})
  .catch((err) => {
    res.status(500)
        .send({message: 'Error retrieving users from contacts database'});
  });
}


