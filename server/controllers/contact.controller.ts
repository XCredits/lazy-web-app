import * as validator from 'validator';
const Contact = require('../models/contact.model');
const ContactGroup = require('../models/contact-group.model');
const ContactGroupContact = require('../models/contact-group-contact.model');
const auth = require('./jwt-auth.controller');

module.exports = function(app) {
  app.post('/api/contacts/add', auth.jwt, addContact);
  app.post('/api/contacts/delete', auth.jwt, deleteContact);
  app.post('/api/contacts/edit', auth.jwt, editContact);
  app.post('/api/contacts/view', auth.jwt, getContactSummary);
  app.post('/api/contacts/details', auth.jwt, getContactDetails);
  app.post('/api/contacts/group/get-groups', auth.jwt, getGroups);
  app.post('/api/contacts/group/get-contacts', auth.jwt, groupGetContacts);
  app.post('/api/contacts/group/view', auth.jwt, getGroupsSummary);
  app.post('/api/contacts/group/add', auth.jwt, addGroup);
  app.post('/api/contacts/group/delete', auth.jwt, deleteGroup);
  app.post('/api/contacts/group/remove-contact', auth.jwt, deleteGroupContact);
  app.post('/api/contacts/group/edit', auth.jwt, editGroup);
  app.post('/api/sample', auth.jwt, testFun);
};


/**
 * join a contact group
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function addContact(req, res) {
  const userId = req.userId;
  const email = req.body.email;
  const givenName = req.body.givenName;
  const familyName = req.body.familyName;
  const contactGroupId = req.body.contactGroupId;

  // Validate
  if (typeof givenName !== 'string' ||
      typeof familyName !== 'string' ||
      !validator.isEmail(email) ) {
    return res.status(422).json({ message: 'Request failed validation' });
  }

  const contact = new Contact({
    userId,
    email,
    givenName,
    familyName,
  });
  return contact.save()
      .then(result => {
        const contactGroupContact = new ContactGroupContact({
          userId: userId,
          contactId: result._id,
          groupId: ( contactGroupId !== null ) ? contactGroupId : null,
        });
        return contactGroupContact.save()
            .then(contactGroupResult => {
                return res.send({ message: 'Success.', contactId: contactGroupResult.contactId });
            })
            .catch(error => {
              return res.status(500).send('Problem creating contacts group.');
            });
      })
      .catch(error => {
        return res.status(500).send('Problem saving contacts.');
      });
}



/**
 * edit a contact group
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function editContact(req, res) {
  const userId = req.userId;
  const email = req.body.email;
  const givenName = req.body.givenName;
  const familyName = req.body.familyName;
  const contactGroupId = req.body.contactGroupId;
  const contactId = req.body.contactId;
  // Validate
  if (typeof contactId !== 'string' ||
      typeof contactGroupId !== 'string' ||
      typeof givenName !== 'string' ||
      typeof familyName !== 'string' ||
      typeof email !== 'string' ||
      !validator.isEmail(email) ) {
    return res.status(422).json({ message: 'Request failed validation.' });
  }

  return Contact.findOneAndUpdate({
          userId,
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
      .then(error => {
        return res.send({ message: 'Contact updated.' });
      })
      .catch(error => {
        res.status(500)
          .send({ message: 'Could not update contact.' });
      });
}


/**
 * delete a contact
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

  return ContactGroupContact.deleteMany({ userId, contactId: contactId })
      .then(() => {
        return Contact.deleteMany({ userId: userId, _id: contactId })
            .then(() => {
              return res.send({ message: 'Contact deleted.' });
            })
            .catch(error => {
              return res.status(500).send('Problem removing contacts.');
            });
      })
      .catch(error => {
        return res.status(500).send('Problem removing contacts.');
      });
}

function testFun(req, res) {
  const userId = req.userId;
  return Contact.find({ userId: userId })
  .then(contactsArr => {
    const promiseArray: Promise<any>[] = [];

    for (const contact of contactsArr) {
      const getContactGroupPromise = ContactGroupContact.find({
        userId: userId,
        'contactId': contact._id,
      },
      {
        contactId: 1,
        groupId: 1,
        userId: 1
      })
      .then(result => {
        // console.log(result);
        for ( const ee of result) {
          promiseArray.push(ee);
        }
        console.log(promiseArray.length);
        const unique_array: Promise<any>[] = [];

        for (let i = 0; i < promiseArray.length; i++) {
          if (unique_array.indexOf(promiseArray[i]) === -1) {
              unique_array.push( promiseArray [i] );
          }
      }
      return Promise.all(unique_array)
            .then(resultArray => {

              console.log(resultArray);
            });

    // console.log(contactsArr);
    // console.log(contactsArr.length);
    // res.send(contactsArr);

  })
  .catch(error => {
    return res.status(500).send({ message: 'Error retrieving groups from database.' });
  });
}


/**
 * returns contacts summary
 * @param {*} req request object
 * @param {*} res response object
 * @returns {*}
 */
function getContactSummary(req, res) {
  const userId = req.userId;
  return Contact.find({ userId: userId })
      .then(contactsArr => {
        const promiseArray: Promise<any>[] = [];
        for (const contact of contactsArr) {
          const getContactGroupPromise = ContactGroupContact.find({
            userId: userId,
            'contactId': contact._id,
          },
          {
            contactId: 1,
            groupId: 1,
            userId: 1
          });
          console.log(getContactGroupPromise);
          promiseArray.push(getContactGroupPromise);
        }
        return Promise.all(promiseArray)
            .then(resultArray => {
              console.log(promiseArray);
              console.log('----');
             // console.log(resultArray[resultArray.length - 1].length);
              console.log('----');
             // console.log(resultArray[resultArray.length - 1][0]);
              console.log('----');
              const array1 = [];
              for (const ee of resultArray) {
                array1.push(ee);
              }
              console.log('----*');
              console.log(array1[array1.length - 1]['_id']);
              console.log('----*');
             // console.log(array1[1][0]);
              const contactsResult = [];
              let groupFilter = '';
              for (let i = 0; i < contactsArr.length; i++) {
                groupFilter = '';
                for (let element = 0; element < resultArray.length; element++) {
                  if (resultArray[element].length !== 0) {
                    // console.log(resultArray[element]);
                    if (String(resultArray[element][0]['contactId']) === String(contactsArr[i]._id)) {
                      groupFilter = resultArray[element][0]['groupId'];
                    }
                  }
                }
                contactsResult.push({
                  _id: contactsArr[i]._id,
                  givenName: contactsArr[i].givenName,
                  familyName: contactsArr[i].familyName,
                  groupId: groupFilter,
                });
              }
              res.send(contactsResult);
            })
            .catch(error => {
              console.log(error);
              return res.status(500).send({ message: 'Error retrieving groups from database..' });
            });
      })
      .catch(error => {
        return res.status(500).send({ message: 'Error retrieving groups from database.' });
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
  return Contact.findOne({ userId: userId, _id: contactId }, { userId: 1, givenName: 1, familyName: 1, email: 1 })
      .then(resultContact => {
        return res.send(resultContact);
      })
      .catch(error => {
        return res.status(500).send({ message: 'Error retrieving user from contacts database.' });
      });
}


/**
 * returns all groups counted
 * @param {*} req request object
 * @param {*} res response object
 * @returns {*}
 */
function getGroupsSummary(req, res) {
  const userId = req.userId;
  return ContactGroup.find({ userId: userId })
      .then(groupIdArr => {
        const promiseArray: Promise<any>[] = [];
        for (const i of groupIdArr) {
          const getContactPromise = ContactGroupContact.countDocuments({
            userId: userId,
            'groupId': i._id,
          });
          promiseArray.push(getContactPromise);
        }
        return Promise.all(promiseArray)
            .then(resultArray => {
              const groupResults = [];
              for ( let i = 0; i < groupIdArr.length; i++ ) {
                groupResults.push({_id: groupIdArr[i]._id, groupName: groupIdArr[i].groupName, numberOfContacts: resultArray[i] });
              }
              return res.send(groupResults);
            })
            .catch(error => {
              return res.status(500).send({ message: 'Error retrieving groups from database.' });
            });
      })
      .catch(error => {
        return res.status(500).send({ message: 'Error retrieving groups from database.' });
      });
}


/**
 * add a group
 * @param {*} req request object
 * @param {*} res response object
 * @returns {*}
 */
function addGroup(req, res) {
  const userId = req.userId;
  const groupName = req.body.groupName;
  // Validate
  if (typeof groupName !== 'string') {
    return res.status(422).json({ message: 'Request failed validation.' });
  }
  return ContactGroup.findOne({ userId, groupName: groupName })
      .then(resultGroupName => {
        if (resultGroupName !== null) {
          if (groupName === resultGroupName.groupName) {
            return res.send({ message: 'Group already exist.' });
          }
        } else {
          const contactGroup = new ContactGroup({
            groupName: groupName,
            userId,
          });
          return contactGroup.save()
              .then(result => {
                return res.send({ message: 'Success.' });
              })
              .catch(error => {
                return res.status(500).send('Problem creating a group.');
              });
        }
      })
      .catch(error => {
        return res.status(500).send('Problem finding a group.');
      });
}




/**
 * delete a group
 * @param {*} req request object
 * @param {*} res response object
 * @returns {*}
 */
function deleteGroup(req, res) {
  const userId = req.userId;
  const groupId = req.body.groupId;

  // Validate
  if (typeof groupId !== 'string' ) {
    return res.status(422).json({ message: 'Contact failed validation.' });
  }

  return ContactGroupContact.find({ userId, groupId })
      .then(result => {
        const contactId = result.map((x => x.contactId));
        return Contact.deleteMany({ userId: userId, _id: contactId })
            .then(() => {
              return ContactGroupContact.deleteMany({ userId, groupId: groupId })
                  .then(() => {
                    return ContactGroup.deleteMany({ userId, _id: groupId })
                        .then(() => {
                          return res.send({ message: 'Group deleted.' });
                        })
                        .catch(error => {
                          return res.status(500).send('Problem removing group.');
                        });
                  })
                  .catch(error => {
                    return res.status(500).send('Problem removing group contacts.');
                  });
            })
            .catch(error => {
              return res.status(500).send('Problem removing groups links.');
            });
      })
      .catch(error => {
        return res.status(500).send('Problem finding group.');
      });
}



/**
 * remove a contact from a group
 * @param {*} req request object
 * @param {*} res response object
 * @returns {*}
 */
function deleteGroupContact(req, res) {
    const userId = req.userId;
    const contactId = req.body.contactId;

    // Validate
    if (typeof contactId !== 'string' ) {
      return res.status(422).json({ message: 'Contact failed validation.' });
    }

    return ContactGroupContact.deleteMany({ userId, contactId })
      .then(() => {
            return res.send({ message: 'Contact removed.' });
          })
          .catch(error => {
            return res.status(500).send('Problem removing contact.');
          });
    }



/**
 * edit group name
 * @param {*} req request object
 * @param {*} res response object
 * @returns {*}
 */
function editGroup(req, res) {
  const userId = req.userId;
  const groupId = req.body.groupId;
  const updatedGroupName = req.body.updatedGroupName;
  // Validate
  if (typeof groupId !== 'string' ||
    typeof updatedGroupName !== 'string') {
    return res.status(422).json({ message: 'Request failed validation.' });
  }

  return ContactGroup.findOneAndUpdate({
        userId,
        _id: groupId,
      },
      {
        $set:
        {
          groupName: updatedGroupName,
        }
    })
    .then(() => {
      return res.send({ message: 'Group updated.' });
    })
    .catch(error => {
      res.status(500)
        .send({ message: 'Could not update Group.' });
    });
}


/**
 * returns all groups
 * @param {*} req request object
 * @param {*} res response object
 * @returns {*}
 */
function groupGetContacts(req, res) {
  const userId = req.userId;
  const groupId = req.body.groupId;
  // Validate
  if (typeof groupId !== 'string') {
    return res.status(422).json({ message: 'Request failed validation.' });
  }
  return ContactGroupContact.find({ userId, groupId })
      .then((result) => {
        const contactId = result.map((x => x.contactId));
        return Contact.find({ userId: userId, '_id': { '$in': contactId } },
              { contactId: 1, givenName: 1, familyName: 1, email: 1 })
            .then((filteredResult) => {
              return res.send(filteredResult);
            })
            .catch(error => {
              res.status(500).send({ message: 'Problem finding contacts.' });
            });
      })
      .catch(error => {
        res.status(500).send({ message: 'Problem finding group.' });
      });
}



/**
 * returns groups of contacts
 * @param {*} req request object
 * @param {*} res response object
 * @returns {*}
 */
function getGroups(req, res) {
  const userId = req.userId;

  return ContactGroup.find({ userId: userId })
      .then(result => {
        console.log(result[0]);
        return res.send(result);
      })
      .catch(error => {
        res.status(500).send({ message: 'Problem finding groups.' });
      });
}

