const Organization = require('../models/organization.model');
const UserOrganization = require('../models/user-organization.model');
const authenticate = require('./jwt-auth.controller');

import {uploadSingleImage} from '../services/image-upload';

module.exports = function(app) {
  app.post('/api/organization/create', authenticate.jwtRefreshToken, orgRegister);
  app.get('/api/organization/details', authenticate.jwt, orgDetails);
};

function orgRegister(req, res) {
  const { organisationName, website, phoneNumber, orgUsername } = req.body;
  const userId = req.userId;
  if (typeof userId !== 'string' ||
      typeof organisationName !== 'string' ||
      typeof website !== 'string' ||
      typeof phoneNumber !== 'string' ||
      typeof orgUsername !== 'string') {

      return res.status(500).send({message: 'Request validation failed'});
  }
  const organization = new Organization({ organisationName, website, phoneNumber, orgUsername });
  const userOrg = new UserOrganization();
  return organization.save((error) => {
    if (error) {
      return res.status(500).send({message: 'Error in Creating Organization'});
    }
    userOrg.userId = userId;
    userOrg.orgId = organization._id;
    return userOrg.save()
      .then(() => {
        res.status(200).send({message: 'UserId and OrganizationId saved successfully'});
      })
      .catch(() => {
        res.status(500).send({message: 'Error in Saving User ID and Organization ID'});
      });
  });
}

function orgDetails(req, res) {
  const userId = req.userId;
  UserOrganization.find({userId: userId})
    .then((userOrgArr) => {
      const orgIds = userOrgArr.map(orgEle => orgEle.orgId);
      Organization.find({ '_id': { '$in': orgIds}})
      .then((orgInfo) => {
        res.send(orgInfo);
      })
      .catch(() => {
        return res.status(500).send({message: 'Error in finding Organization'});
     });
  });
}
