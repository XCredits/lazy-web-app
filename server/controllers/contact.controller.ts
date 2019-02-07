import * as validator from 'validator';
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
  if (typeof givenName !== 'string' ||
      typeof familyName !== 'string' ||
      !validator.isEmail(email) ) {
    return res.status(422).json({ message: 'request failed validation' });
  }

  const contact = new Contact({
    userId: req.userId,
    email,
    givenName,
    familyName,
  });
  return contact.save()
      .then((result) => {
        res.status(200).send({ message: 'success' });
      })
      .catch((error) => {
        return res.status(500).send('problem finding contacts.');
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
  Contact.find({ userId })
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
        return res.status(500).send({ message: 'error retrieving users from contacts database' });
      });
}
