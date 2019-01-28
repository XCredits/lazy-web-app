const Organization = require('../models/organization.model');
const UserOrganization = require('../models/user-organization.model');
const authenticate = require('./jwt-auth.controller');

import {uploadSingleImage} from '../services/image-upload';

module.exports = function(app) {
  app.post('/api/organization/create', authenticate.jwt, createOrg);
  app.get('/api/organization/details', authenticate.jwt, orgDetails);
  app.post('/api/organization/update-details', authenticate.jwt, updateOrg);
};

function createOrg(req, res) {
  const { organisationName, website, phoneNumber, orgUsername } = req.body;
  const userId = req.userId;
  if (typeof userId !== 'string' ||
      typeof organisationName !== 'string' ||
      typeof website !== 'string' ||
      typeof phoneNumber !== 'string' ||
      typeof orgUsername !== 'string') {

      return res.status(500).send({message: 'Request validation failed'});
  }
  const organization = new Organization({ organisationName, website,
      phoneNumber, orgUsername });
  const userOrg = new UserOrganization();
  return organization.save((error) => {
    if (error) {
      return res.status(500).send({message: 'Error in Creating Organization'});
    }
    userOrg.userId = userId;
    userOrg.orgId = organization._id;
    userOrg.roles = ['admin'];
    return userOrg.save()
      .then(() => {
        res.status(200).send({
          message: 'UserId and OrganizationId saved successfully'
        });
      })
      .catch(() => {
        res.status(500).send({message: 'Error in Saving user role and organization.'});
      });
  });
}

function orgDetails(req, res) {
  const userId = req.userId;
  UserOrganization.find({'userId': userId})
      .then((userOrgArr) => {
        const orgIds = userOrgArr.map(orgEle => orgEle.orgId);
        return Organization.find({ '_id': { '$in': orgIds}});
      })
      .then((orgInfo) => {
        res.send(orgInfo);
      })
      .catch((err) => {
        return res.status(500).send({message: 'Error in finding organization'});
      });
}

function updateOrg(req, res) {
  const userId = req.userId;
  const id = req.body.id;
  const name = req.body.organisationName;
  const website = req.body.website;
  const phoneNumber = req.body.phoneNumber;
  const username = req.body.orgUsername;

  if (typeof id !== 'string') {
    return res.status(500).send({message: 'Request validation failed'});
  }
  return Organization.findOne({'_id': id})
    .then((org) => {
      org.organisationName = name;
      org.website = website;
      org.phoneNumber = phoneNumber;
      org.orgUsername = username;
      return org.save()
        .then(() => {
          return res.status(200).send({message: 'Organization details updated successfully'});
        })
        .catch(() => {
          return res.status(500).send({message: 'Error in Updating'});
        });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({message: 'Orgainzation not found'});
    });
}
