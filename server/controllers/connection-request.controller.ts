import * as validator from 'validator';
const MailingList = require('../models/mailing-list.model.js');
const emailService = require('../services/email.service.js');
const statsService = require('../services/stats.service.js');
const {isValidDisplayUsername, normalizeUsername} =
    require('./utils.controller');
const Connection = require('../models/connections.model');
const User = require('../models/user.model');

module.exports = function(app) {
  app.post('/api/user/add-connection-request', addConnectionRequest);
  app.post('/api/user/get-user-request', requestUserID);

};

/**
 * join a contact list
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function addConnectionRequest(req, res) {
  console.log('joining connection request ');
  const senderID = req.body.senderID;
  const receiverID = req.body.receiverID;

  const _connection = new Connection();
  _connection.senderID = senderID;
  _connection.receiverID = receiverID;
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
          return {_id: x._id};
        });
        res.send(resultsFiltered);
      })
      .catch((err) => {
        return res.status(500).send({message: 'UserId not found...'});
      });
}
