import * as validator from 'validator';
const MailingList = require('../models/mailing-list.model.js');
const emailService = require('../services/email.service.js');
const statsService = require('../services/stats.service.js');
const Contact = require('../models/contact.model.js');
const auth = require('./jwt-auth.controller');

module.exports = function(app) {
  app.post('/api/contacts/add', auth.jwt, addContact);
  app.get('/api/contacts/view', auth.jwt, viewContacts);
};


/**
 * join a contact list
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function addContact(req, res) {

  const email = req.body.email;
  const givenName = req.body.givenName;
  const familyName = req.body.familyName;

  // Validate
  if (typeof req.userId !== 'string' ||
      typeof email !== 'string' ||
      typeof givenName !== 'string' ||
      typeof familyName !== 'string' ||
      !validator.isEmail(email) ) {
            return res.status(422).json({ message: 'Request failed validation' });
        }

  const contactListUser = new Contact();
  contactListUser.loginUserId = req.userId;
  contactListUser.email = email;
  contactListUser.givenName = givenName;
  contactListUser.familyName = familyName;
  return contactListUser.save()
        .then((result) => {
            res.status(200).send({ message: 'Success' });
        })
        .catch((error) => {
          return res.status(500).send('Problem finding contacts.');
        });
}


/**
 * returns all users for now
 * @param {*} req request object
 * @param {*} res response object
 * @returns {*}
 */
function viewContacts(req, res) {
  const userId = req.userId;
  if (typeof userId !== 'string') {
    return res.status(422).json({ message: 'Request failed validation' });
  }

  Contact.find({ loginUserId: userId })
      .then((result) => {
            const filteredResult = result.map((x) => {
              return {
                    givenName: x.givenName,
                    familyName: x.familyName,
                    email: x.email
                    };
            });
            res.send(filteredResult);
        })
        .catch(() => {
          return res.status(500).send({ message: 'Error retrieving users from contacts database' });
        });
}
