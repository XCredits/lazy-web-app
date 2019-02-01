import * as validator from 'validator';
import { ContactsComponent } from '../../src/app/contacts/contacts.component';
const MailingList = require('../models/mailing-list.model.js');
const emailService = require('../services/email.service.js');
const statsService = require('../services/stats.service.js');
const Contact = require('../models/contact.model.js');

module.exports = function(app) {
  console.log('Before API===');
  app.post('/api/join-contact-list', joinContactList);
};

/**
 * join a contact list
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function joinContactList(req, res) {
  console.log('joingContactList function');
  const email = req.body.email;
  const givenName = req.body.givenName;
  const familyName = req.body.familyName;
  // Validation
  if (typeof email !== 'string' ||
      typeof givenName !== 'string' ||
      typeof familyName !== 'string' ||
      !validator.isEmail(email)
    ) {
    return res.status(422).json({message: 'Request failed validation'});
  }

  const contactListUser = new Contact();
  contactListUser.email = email;
  contactListUser.givenName = givenName;
  contactListUser.familyName = familyName;
  return contactListUser.save()
      .then((result) => {
        res.status(200).send({message: 'Success'});
        return statsService.increment(Contact)
            .catch((err) => {
              console.log('Error in the contact service');
            });
      })
      .then(() => {
        return emailService.addUserToMailingList({
              givenName, familyName, email,
            })
            .catch((err) => {
              console.log('Error in the mailing list service');
            });
      })
      .then(() => {
        return emailService.sendMailingListWelcome({
              givenName, familyName, email,
            })
            .catch((err) => {
              console.log('Error in the send email service');
            });
      })
      .catch((error) => {
        console.log('Error');
        console.log(error.message);
        return res.status(500).json({message: error.message});
      });
}

