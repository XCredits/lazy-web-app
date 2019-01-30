const Organization = require('../models/organization.model');
const UserOrganization = require('../models/user-organization.model');
const authenticate = require('./jwt-auth.controller');
const User = require('../models/user.model');

import {uploadSingleImage} from '../services/image-upload';

module.exports = function(app) {
  app.post('/api/organization/create', authenticate.jwt, createOrg);
  app.get('/api/organization/details', authenticate.jwt, orgDetails);
  app.get('/api/organization/get-details', authenticate.jwt, orgGet);
  app.post('/api/organization/update-details', authenticate.jwt, updateOrg);
  app.post('/api/organization/image-upload', authenticate.jwt, orgImageUpload);
  app.post('/api/organization/add-user', authenticate.jwt, orgAddUser);
  app.get('/api/organization/get-roles', authenticate.jwt, orgGetRole);
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
        const userOrg = userOrgArr.map(orgEle => orgEle);
        return Organization.find({ '_id': { '$in': orgIds}})
        .then((orgInfo) => {
         return res.json({Org: orgInfo, userOrg: userOrg});
        })
        .catch((err) => {
          return res.status(500).send({message: 'Error in finding organization'});
        });
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
              return res.status(500).send({message: 'Image upload failed'});
            });
      })
      .catch(() => {
        return res.status(500).send({message: 'Organization not found'});
      });
  });
}

function orgGet(req, res) {
  const userId = req.userId;
  const username = req.query.username;
  if (typeof userId !== 'string' ||
      typeof username !== 'string') {
        return res.status(500).send({message: 'Request validation failed'});
  }
  return Organization.findOne({'username': username})
    .then((org) => {
      return UserOrganization.findOne({'userId': userId, 'orgId': org._id})
        .then((userOrg) => {
          if (userOrg && userOrg.roles[0] === 'admin') { // indexof
            return res.send(org);
          } else {
            return res.status(404).send({message: 'Unauthorised User'});
          }
        })
        .catch(() => {
          return res.status(500).send({message: 'User not valid'});
        });
    })
    .catch(() => {
      return res.status(500).send({message: 'Username not found'});
    });
}

function orgAddUser(req, res) {
  const userId = req.userId;
  const orgId = req.body.orgId;
  const username = req.body.username;
  if (typeof userId !== 'string' ||
      typeof orgId !== 'string' ||
      typeof username !== 'string') {
        return res.status(500).send({message: 'Request validation failed'});
      }
  return User.findOne({'username': username})
      .then((user) => {
        return Organization.findOne({'_id' : orgId})
          .then(() => {
            return UserOrganization.findOne({'userId': userId, 'orgId': orgId})
              .then((userOrgArr) => {
                if (userOrgArr.roles[0] === 'admin') {
                  const userOrg = new UserOrganization();
                  userOrg.userId = user._id;
                  userOrg.orgId = orgId;
                  userOrg.roles = ['POS'];
                  return userOrg.save()
                    .then(() => {
                      return res.status(200).send({message: 'User added successfully'});
                    })
                    .catch(() => {
                      return res.status(500).send({message: 'Unsuccessful in adding user'});
                    });
                  }
              })
              .catch(() => {
                return res.status(500).send({message: 'Cannot find user'});
              });
          })
          .catch(() => {
            return res.status(500).send({message: 'Cannot find organisation'});
          });
      })
      .catch(() => {
        return res.status(500).send({message: 'Cannot find user'});
      });
}

function orgGetRole(req, res) {
  const userId = req.userId;
  return UserOrganization.find({'userId': userId})
    .then((userOrg) => {
      const array = userOrg.map(orgEle => orgEle);
      return res.send(array);
    })
    .catch(() => {
      return res.status(500).send({message: 'Invalid userId'});
    });
}
