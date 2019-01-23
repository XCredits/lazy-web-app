import * as validator from 'validator';
const MailingList = require('../models/mailing-list.model.js');
const emailService = require('../services/email.service.js');
const statsService = require('../services/stats.service.js');
const Connection = require('../models/connections.model');

module.exports = function(app) {
  app.post('/api/user/add-connection-request', addConnectionRequest);
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

