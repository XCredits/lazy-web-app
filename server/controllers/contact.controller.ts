import * as validator from 'validator';
const Contact = require('../models/contact.model');
const ContactList = require('../models/contact-list.model');
const ContactListContact = require('../models/contact-list-contact.model');
const auth = require('./jwt-auth.controller');

module.exports = function(app) {
  app.post('/api/contacts/add', auth.jwt, addContact);
  app.post('/api/contacts/delete', auth.jwt, deleteContact);
  app.post('/api/contacts/edit', auth.jwt, editContact);
  app.post('/api/contacts/view', auth.jwt, getContactSummary);
  app.post('/api/contacts/details', auth.jwt, getContactDetails);
  app.post('/api/contacts/get-contacts-with-lists', auth.jwt, getContactsWithLists);
  app.post('/api/contacts/get-contacts-with-contactlists', auth.jwt, getContactsWithContactLists);
  app.post('/api/contacts-list/view', auth.jwt, getLists);
  app.post('/api/contacts-list/add', auth.jwt, addList);
  app.post('/api/contacts-list/delete', auth.jwt, deleteList);
  app.post('/api/contacts-list/edit', auth.jwt, editList);
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
  const contactListId = req.body.contactListId;

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
  });
  return contact.save()
    .then((result) => {
      const contactListContact = new ContactListContact({
      contactId: result._id,
      listId: ( contactListId !== null ) ? contactListId : null,
      });
      return contactListContact.save()
        .then((contactListResult) => {
            return res.send({ message: 'Success.' , contactId: contactListResult.contactId });
          })
          .catch((error) => {
            return res.status(500).send('Problem creating contacts list.');
          });
    })
    .catch((error) => {
        return res.status(500).send('Problem saving contacts.');
    });
}



/**
 * join a contact list
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function editContact(req, res) {
  const userId = req.userId;
  const email = req.body.email;
  const givenName = req.body.givenName;
  const familyName = req.body.familyName;
  const contactId = req.body.contactId;
  // Validate
  if (typeof contactId !== 'string' ||
      typeof givenName !== 'string' ||
      typeof familyName !== 'string' ||
      !validator.isEmail(email) ) {
    return res.status(422).json({ message: 'Request failed validation.' });
  }


  return Contact.findOneAndUpdate({
    userId: userId,
    _id: contactId,
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
      return res.send({ message: 'Contact updated.' });
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
function deleteContact(req, res) {
  const userId = req.userId;
  const contactId = req.body.contactId;
  // Validate
  if (typeof contactId !== 'string') {
    return res.status(422).json({ message: 'Contact failed validation.' });
  }

  return ContactListContact.deleteMany( {contactId: contactId } )
  .then(() => {
    return Contact.deleteMany( {userId: userId, _id: contactId } )
      .then(() => {
        return res.send({ message: 'Contact deleted.' });
      })
      .catch((error) => {
        return res.status(500).send('Problem removing contacts.');
      });
  })
  .catch((error) => {
    return res.status(500).send('Problem removing contacts.');
  });
}


/**
 * returns all contacts summary
 * @param {*} req request object
 * @param {*} res response object
 * @returns {*}
 */
function getContactSummary(req, res) {
  const userId = req.userId;
  Contact.find({ userId }).sort( {givenName: 1} )
    .then((result) => {
      const filteredResult = result.map((x) => {
        return {
          contactId: x._id,
          givenName: x.givenName,
          familyName: x.familyName,
          email: x.email,
        };
      });
      return res.send(filteredResult);
    })
    .catch((error) => {
      return res.status(500).send({ message: 'Error retrieving users from contacts database.' });
    });
}


/**
 * returns contact details
 * @param {*} req request object
 * @param {*} res response object
 * @returns {*}
 */
function getContactDetails(req, res) {
  const userId = req.userId;
  const contactId = req.body.contactId;
  // Validate
  if (typeof contactId !== 'string') {
    return res.status(422).json({ message: 'Contact failed validation.' });
  }

  Contact.findOne({ userId: userId, _id: contactId })
    .then(resultContact => {
      const resultsFiltered = {
        _id: resultContact._id,
        userId: resultContact.userId,
        givenName: resultContact.givenName,
        familyName: resultContact.familyName,
        email: resultContact.email,
      };
    res.send(resultsFiltered);
    })
    .catch((error) => {
      return res.status(500).send({ message: 'Error retrieving user from contacts database.' });
    });
}
/**
 * returns all lists
 * @param {*} req request object
 * @param {*} res response object
 * @returns {*}
 */
function getLists(req, res) {
  const userId = req.userId;
  ContactList.find({ refId: userId }).sort( {name: 1} )
    .then((result) => {
      const filteredResult = result.map((x) => {
        return {
          listId: x._id,
          listName: x.listName,
        };
      });
      return res.send(filteredResult);
    })
    .catch((error) => {
      return res.status(500).send({ message: 'Error retrieving list form database.' });
    });
}



/**
 * add a list
 * @param {*} req request object
 * @param {*} res response object
 * @returns {*}
 */
function addList(req, res) {
  const userId = req.userId;
  const listName = req.body.listName;
  // Validate
  if (typeof listName !== 'string' ) {
    return res.status(422).json({ message: 'Request failed validation.' });
  }
  return ContactList.findOne({refId: userId , listName: listName })
    .then((resultListName) => {
      if ( resultListName !== null) {
        if (listName === resultListName.listName) {
          res.send({ message: 'List already exist.' });
        }
      } else {
        const contactList = new ContactList({
          listName: listName,
          refId: userId,
        });
        return contactList.save()
          .then((result) => {
            return res.send({ message: 'Success.' });
          })
          .catch((error) => {
            return res.status(500).send('Problem creating a list.');
          });
      }
    })
    .catch((error) => {
      return res.status(500).send('Problem finding a list.');
    });
}

function deleteList(req, res) {
  const userId = req.userId;
  const listId = req.body.listId;

  // Validate
  if (typeof listId !== 'string' ) {
    return res.status(422).json({ message: 'Contact failed validation.' });
  }

  return ContactListContact.find({ listId })
    .then (( result ) => {
      const contactId = result.map ((x => x.contactId));
      return Contact.deleteMany ({userId: userId, _id: contactId})
        .then (() => {
          return ContactListContact.deleteMany({ listId: listId })
            .then(() => {
              return ContactList.deleteMany({ refId: userId, _id: listId })
                .then(() => {
                  return res.send({ message: 'List deleted.' });
                })
                .catch((error) => {
                  return res.status(500).send('Problem removing list.');
                });
            })
            .catch ((error) => {
              return res.status(500).send('Problem list contacts.');
            });
        })
        .catch ((error) => {
          return res.status(500).send('Problem removing lists links.');
      });
    })
    .catch ((error) => {
        return res.status(500).send('Problem finding list.');
    });
  }

function editList(req, res) {
  const userId = req.userId;
  const listId = req.body.listId;
  const UpdatedListName = req.body.UpdatedListName;
  // Validate
  if (typeof listId !== 'string' ||
      typeof UpdatedListName !== 'string' ) {
    return res.status(422).json({ message: 'Request failed validation.' });
  }

  return ContactList.findOneAndUpdate({
    refId: userId,
    _id: listId,
  },
  {
    $set:
    {
      listName: UpdatedListName,
    }
  })
  .then(() => {
    return res.send({ message: 'List updated.' });
  })
  .catch((error) => {
    res.status(500)
      .send({ message: 'Could not update List.' });
  });
}



/**
 * returns all users with contacts
 * @param {*} req request object
 * @param {*} res response object
 * @returns {*}
 */
function getContactsWithLists(req, res) {
  const userId = req.userId;
  return Contact.find({ userId })
    .then((result) => {
      const listIdArr = result.map((e => e._id));
      return ContactListContact.find({ 'contactId': { '$in': listIdArr } })
        .then((result2) => {
          const filteredResult = result2.map((x) => {
            return {
              contactId: x.contactId,
              listId: x.listId,
            };
          });
          return res.send(filteredResult);
        })
        .catch((error) => {
          return res.status(500).send({ message: 'Error retrieving users from contacts database.' });
        });
    })
    .catch((error) => {
      return res.status(500).send({ message: 'Error retrieving users from contacts database.' });
    });
}



/**
 * returns lists of contacts
 * @param {*} req request object
 * @param {*} res response object
 * @returns {*}
 */
function getContactsWithContactLists(req, res) {
  const userId = req.userId;
  const listId = req.body.listId;
 // Validate
  if (typeof listId !== 'string' ) {
    return res.status(422).json({ message: 'Request failed validation.' });
  }
  return ContactListContact.find({ listId })
    .then((result) => {
      const contactId = result.map((x => x.contactId));
      return Contact.find({userId: userId, '_id': { '$in': contactId } })
        .then((filteredResult) => {
          const resultFiltered = filteredResult.map((x) => {
              return {
                givenName: x.givenName,
                familyName: x.familyName,
                email: x.email,
                contactId: x._id,
              };
          });
          res.send(resultFiltered);
        })
        .catch((error) => {
          res.status(500).send({ message: 'Problem finding contacts.' });
        });
    })
    .catch((error) => {
      res.status(500).send({ message: 'Problem finding list.' });
    });
}

