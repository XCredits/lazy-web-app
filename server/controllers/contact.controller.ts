import * as validator from 'validator';
import { normalizeContact } from './utils.controller';
import { resource } from 'selenium-webdriver/http';

const Contact = require('../models/contact.model');
const ContactList = require('../models/contact-list.model');
const ContactListContact = require('../models/contact-list-contact.model');
const auth = require('./jwt-auth.controller');

module.exports = function(app) {
  app.post('/api/contacts/add', auth.jwt, addContact);
  app.post('/api/contacts/remove', auth.jwt, removeContact);
  app.post('/api/contacts/update', auth.jwt, updateContact);
  app.post('/api/contacts/view', auth.jwt, viewContacts);
  app.post('/api/contacts/view-contacts-with-lists', auth.jwt, returnAllContactsWithLists);
  app.post('/api/contacts/view-list-contacts', auth.jwt, returnListContacts);

  app.post('/api/contacts-list/view', auth.jwt, viewLists);
  app.post('/api/contacts-list/add', auth.jwt, addList);
  app.post('/api/contacts-list/get-lists-count', auth.jwt, getListsCount);
  app.post('/api/contacts-list/remove', auth.jwt, removeList);
  app.post('/api/contacts-list/update', auth.jwt, updateList);
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
  let givenName = req.body.givenName;
  let familyName = req.body.familyName;
  const contactListId = req.body.contactListId;

  // Validate
  if (typeof givenName !== 'string' ||
      typeof familyName !== 'string' ||
      typeof contactListId !== 'string' ||
      !validator.isEmail(email) ) {
    return res.status(422).json({ message: 'Request failed validation' });
  }

  givenName = normalizeContact(givenName);
  familyName = normalizeContact(familyName);

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
          listId: contactListId
        });
        return contactListContact.save()
            .then((contactListResult) => {
              return res.send({ message: 'Success' });
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
function updateContact(req, res) {
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
    return res.status(422).json({ message: 'Request failed validation' });
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
  const contactId = req.body.contactId;
  console.log(userId);
  console.log(contactId);
  // Validate
  if (typeof contactId !== 'string' ||
      typeof userId !== 'string' ) {
        return res.status(422).json({ message: 'Contact failed validation' });
  }

  return ContactListContact.deleteOne( {contactId: contactId } )
  .then(() => {
        return Contact.deleteOne( {_id: contactId } )
          .then(() => {
            return res.send({ message: 'Contact deleted' });
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
 * returns all users for now
 * @param {*} req request object
 * @param {*} res response object
 * @returns {*}
 */
function viewContacts(req, res) {
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
      .catch(() => {
        return res.status(500).send({ message: 'Error retrieving users from contacts database' });
      });
}



/**
 * returns all lists
 * @param {*} req request object
 * @param {*} res response object
 * @returns {*}
 */
function viewLists(req, res) {
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
      .catch(() => {
        return res.status(500).send({ message: 'Error retrieving list form database.' });
      });
}




/**
 * returns all lists count
 * @param {*} req request object
 * @param {*} res response object
 * @returns {*}
 */
function getListsCount(req, res) {
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
      .catch(() => {
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
  let listName = req.body.listName;
  // Validate
  if (typeof listName !== 'string' ) {
    return res.status(422).json({ message: 'Request failed validation' });
  }

  listName = normalizeContact(listName);
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
                return res.send({ message: 'Success' });
              })
              .catch((error) => {
                return res.status(500).send('Problem creating a list.');
              });
          }
        }).catch((error) => {
              console.log(error);
              return res.status(500).send('Problem finding a list.');
          });
}

function removeList(req, res) {
  const userId = req.userId;
  const listId = req.body.listId;

  // Validate
  if (typeof listId !== 'string' ) {
        return res.status(422).json({ message: 'Contact failed validation' });
  }


  return ContactListContact.find({ listId })
      .then (( result ) => {
        const contactId = result.map ((x => x.contactId));
        return Contact.deleteMany ({ _id: contactId})
        .then (() => {
          return ContactListContact.deleteMany({ listId: listId })
          .then((reus) => {
            console.log(reus);
                return ContactList.deleteOne({ _id: listId })
                  .then(() => {
                    return res.send({ message: 'List deleted' });
                  })
                  .catch((error) => {
                    return res.status(500).send('Problem removing list1.');
                  });
          });
        });
      }).catch ((error) => { });
  }

function updateList(req, res) {

}




/**
 * returns all users with contacts
 * @param {*} req request object
 * @param {*} res response object
 * @returns {*}
 */
function returnAllContactsWithLists(req, res) {
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
                  console.log(error);
                  return res.status(500).send({ message: 'Error retrieving users from contacts database' });
              });
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).send({ message: 'Error retrieving users from contacts database' });
        });
  }



function returnListContacts(req, res) {
  const userId = req.userId;
  const listId = req.body.listId;
 // Validate
  if (typeof listId !== 'string' ) {
    return res.status(422).json({ message: 'Request failed validation' });
  }

  return ContactListContact.find( {listId })
      .then(( result ) => {
        const contactId = result.map ((x => x.contactId));
        return Contact.find({'_id': { '$in': contactId}})
            .then(( filteredResult) => {
              const resultFilterd = filteredResult.map ((x) => {
                return {
                  givenName: x.givenName,
                  familyName: x.familyName,
                  email: x.email,
                };
              });
              res.send(resultFilterd);
            })
            .catch((error) => {
              res.status(500).send({ message: 'Error retrieving pending requests 1' });
            });


        })
      .catch((error) => {
        res.status(500).send({ message: 'Error retrieving pending requests 2' });

      });
}

