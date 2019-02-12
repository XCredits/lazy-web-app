import * as validator from 'validator';
const Contact = require('../models/contact.model.js');
const auth = require('./jwt-auth.controller');

module.exports = function(app) {
  app.post('/api/contacts/add', auth.jwt, addContact);
  app.post('/api/contacts/remove', auth.jwt, removeContact);
  app.post('/api/contacts/update', auth.jwt, updateContact);
  app.post('/api/contacts/view', auth.jwt, viewContacts);
  app.post('/api/contacts/fav', auth.jwt, viewFavourites);
  app.post('/api/contacts/add-remove-fav', auth.jwt, addRemoveFavourites);
};


/**
 * join a contact list
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function addContact(req, res) {
  const userId = req.userId;
  const email = req.body.email;
  const givenName = req.body.givenName;
  const familyName = req.body.familyName;
  // Validate
  if (typeof givenName !== 'string' ||
      typeof familyName !== 'string' ||
      !validator.isEmail(email) ) {
    return res.status(422).json({ message: 'Request failed validation' });
  }

  const contact = new Contact({
    userId: userId,
    email,
    givenName,
    familyName,
    isFavourite: false,
  });
  return contact.save()
      .then((result) => {
        return res.send({ message: 'success' });
      })
      .catch((error) => {
        return res.status(500).send('Problem finding contacts.');
      });
}



/**
 * join a contact list
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function updateContact(req, res) {
  const userId = req.userId;
  const email = req.body.email;
  const givenName = req.body.givenName;
  const familyName = req.body.familyName;
  const contactUserId = req.body.contactUserId;
  // Validate
  if (typeof givenName !== 'string' ||
      typeof familyName !== 'string' ||
      !validator.isEmail(email) ) {
    return res.status(422).json({ message: 'Request failed validation' });
  }

  return Contact.findOneAndUpdate({
    userId: userId,
    _id: contactUserId,
    },
    {
      $set:
      {
        familyName: familyName,
        givenName: givenName,
        email: email,
      }
    })
    .then(() => {
      return res.send({ message: 'Contact updated' });
    })
    .catch(() => {
      res.status(500)
        .send({ message: 'Could not update contact.' });
    });
}


/**
 * join a contact list
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function removeContact(req, res) {
  const userId = req.userId;
  const contactUserId = req.body.contactUserId;
  // Validate
  if (typeof userId !== 'string' ||
      typeof contactUserId !== 'string' ) {
    return res.status(422).json({ message: 'Contact failed validation' });
  }

  return Contact.deleteOne( {_id: contactUserId } )
      .then(() => {
        return res.send({ message: 'Contact deleted' });
      })
      .catch((error) => {
        return res.status(500).send('Problem removing contacts.');
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
            email: x.email,
            contactUserId: x._id,
            isFavourite: x.isFavourite,
          };
        });
        return res.send(filteredResult);
      })
      .catch(() => {
        return res.status(500).send({ message: 'Error retrieving users from contacts database' });
      });
}



/**
 * returns all users for now
 * @param {*} req request object
 * @param {*} res response object
 * @returns {*}
 */
function viewFavourites(req, res) {
  const userId = req.userId;
  Contact.find({ userId, isFavourite: true })
      .then((result) => {
        const filteredResult = result.map((x) => {
          return {
            givenName: x.givenName,
            familyName: x.familyName,
            email: x.email,
          };
        });
        return res.send(filteredResult);
      })
      .catch(() => {
        return res.status(500).send({ message: 'Error retrieving users from contacts database' });
      });
}


/** add to favourite list
 * @param {*} req request object
 * @param {*} res response object
 * @returns {*}
 */
function addRemoveFavourites(req, res) {
  const userId = req.userId;
  const contactId = req.body.contactUserId;
  const action = req.body.action;
  // Validate
  if (typeof contactId !== 'string' ) {
    return res.status(422).json({ message: 'Contact failed validation' });
  }

  return Contact.findOneAndUpdate({
    userId: userId,
    _id: contactId,
    },
    {
      $set:
      {
        isFavourite: (action === 'add') ? true : false ,
      }
    })
    .then(() => {
      return res.send({ message: 'Contact modified' });
    })
    .catch(() => {
      res.status(500)
        .send({ message: 'Could not modify contact.' });
    });
}
