const Organization = require('../models/organization.model');
const UserOrganization = require('../models/user-organization.model');
const authenticate = require('./jwt-auth.controller');

import {uploadSingleImage} from '../services/image-upload';

module.exports = function(app) {
  app.post('/api/organization/create', authenticate.jwt, createOrg);
  app.get('/api/organization/details', authenticate.jwt, orgDetails);
  app.post('/api/organization/update-details', authenticate.jwt, updateOrg);
  app.post('/api/organization/image-upload', authenticate.jwt, orgImageUpload);
};

function createOrg(req, res) {
  const { name, website, phoneNumber, username } = req.body;
  const userId = req.userId;
  if (typeof userId !== 'string' ||
      typeof name !== 'string' ||
      typeof website !== 'string' ||
      typeof phoneNumber !== 'string' ||
      typeof username !== 'string') {

      return res.status(500).send({message: 'Request validation failed'});
  }
  const organization = new Organization({ name, website,
      phoneNumber, username });
  const userOrg = new UserOrganization();
  return organization.save()
    .then(() => {
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
    })
    .catch(() => {
      res.status(500).send({message: 'Error in saving organization'});
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
  const name = req.body.name;
  const website = req.body.website;
  const phoneNumber = req.body.phoneNumber;
  const username = req.body.username;

  if (typeof id !== 'string') {
    return res.status(500).send({message: 'Request validation failed'});
  }
  return Organization.findOne({'_id': id})
    .then((org) => {
      org.name = name;
      org.website = website;
      org.phoneNumber = phoneNumber;
      org.username = username;
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

function orgImageUpload(req, res) {
  const id = req.query.id;
  if (typeof id !== 'string') {
    return res.status(500).send({message: 'Request validation failed'});
  }
  uploadSingleImage(req, res, function(err) {
    if (err) {
      return res.status(422).send({errors: [{title: 'Image Upload error', detail: err.message}]});
    }
    Organization.findOne({'_id': id})
      .then((org) => {
          org.logo = req.file.fileLocation;
          return org.save()
            .then(() => {
              return res.status(200).send({message: 'Image uploaded successfully'});
            })
            .catch(() => {
              return res.status(500).send({message: 'Image uploaad'});
            });
      })
      .catch(() => {
        return res.status(500).send({message: 'Organization not found'});
      });
  });
}
