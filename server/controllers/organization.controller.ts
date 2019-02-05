const Organization = require('../models/organization.model');
const UserOrganization = require('../models/user-organization.model');
const authenticate = require('./jwt-auth.controller');
const User = require('../models/user.model');

import {uploadSingleImage} from '../services/image-upload';

module.exports = function(app) {
  app.post('/api/organization/create', authenticate.jwt, createOrg);
  app.post('/api/organization/user-org-summary', authenticate.jwt, userOrgSummary);
  app.post('/api/organization/get-details', authenticate.jwt, getDetails);
  app.post('/api/organization/update-details', authenticate.jwt, updateDetails);
  app.post('/api/organization/image-upload', authenticate.jwt, imageUpload);
  app.post('/api/organization/add-user', authenticate.jwt, addUser);
  app.post('/api/organization/delete', authenticate.jwt, deleteOrg);
  app.post('/api/organization/remove-user', authenticate.jwt, removeUser);
  app.get('/api/organization/updated-details', authenticate.jwt, updatedOrgDetails);
};

/**
 * Throws an error if not an admin
 * @param userId
 * @param orgId
 */
function isOrgAdmin(userId, orgId) {
  return UserOrganization.findOne({'userId': userId, 'orgId': orgId})
      .then((userOrg) => {
        if (userOrg.roles.indexOf('admin') === -1) {
          throw new Error('User part of organization but not authorized admin.');
        }
        return true;
      })
      .catch((error) => {
        throw new Error('User not found in organization.');
      });
}

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
  const organization =
      new Organization({ name, website, phoneNumber, username });
  organization.userCount = 1;
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
              res.status(500).send({
                message: 'Error in Saving user role and organization.'
            });
        });
      })
      .catch(() => {
        res.status(500).send({message: 'Error in saving organization'});
      });
}

function userOrgSummary(req, res) {
  const userId = req.userId;
  if (typeof userId !== 'string') {
    return res.status(500).send({message: 'Request validation failed'});
  }
  let userOrg;
  UserOrganization.find({'userId': userId})
      .then((userOrgArr) => {
        const orgIds = userOrgArr.map(orgEle => orgEle.orgId);
        userOrg = userOrgArr;
        return Organization.find({ '_id': { '$in': orgIds}});
      })
      .then((orgDetails) => {
        return res.json({orgDetails, userOrg});
      })
      .catch(() => {
        return res.status(500).send({message: 'Error in finding organization'});
      });
}

function updateDetails(req, res) {
  const userId = req.userId;
  const orgId = req.body.id;
  const name = req.body.name;
  const website = req.body.website;
  const phoneNumber = req.body.phoneNumber;
  const username = req.body.username;

  if (typeof userId !== 'string' ||
      typeof orgId !== 'string' ||
      typeof name !== 'string' ||
      typeof username !== 'string') {
    return res.status(500).send({message: 'Request validation failed'});
  }
  isOrgAdmin(userId, orgId)
      .then(() => {
        return Organization.findOne({'_id': orgId})
            .then((org) => {
              org.name = name;
              org.website = website;
              org.phoneNumber = phoneNumber;
              org.username = username;  // TO DO: VALIDATE!!!!
              return org.save()
                  .then(() => {
                    return res.status(200).send({
                      message: 'Organization details updated successfully'
                    });
                  })
                  .catch(() => {
                    return res.status(500).send({message: 'Error in updating organization'});
                  });
            })
            .catch((err) => {
              return res.status(500).send({message: 'Organization not found'});
            });
      })
      .catch(() => {
        return res.status(404).send({message: 'Unauthorized access'});
      });
}

function imageUpload(req, res) {
  const userId = req.userId;
  const orgId = req.query.id;
  if (typeof userId !== 'string' ||
      typeof orgId !== 'string') {
    return res.status(500).send({message: 'Request validation failed'});
  }
  isOrgAdmin(userId, orgId)
      .then(() => {
        return uploadSingleImage(req, res, function(err) {
          if (err) {
            return res.status(422).send({errors: [{title: 'Image Upload error', detail: err.message}]});
          }
          return Organization.findOne({'_id': orgId})
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
      })
      .catch(() => {
        return res.status(404).send({message: 'Unauthorized access'});
      });
}

function getDetails(req, res) {
  const userId = req.userId;
  const username = req.body.username;
  if (typeof userId !== 'string' ||
      typeof username !== 'string') {
        return res.status(500).send({message: 'Request validation failed'});
  }
  return Organization.findOne({'username': username})
    .then((orgDetail) => {
      isOrgAdmin(userId, orgDetail._id)
        .then(() => {
          return UserOrganization.find({'orgId': orgDetail._id, 'roles': 'POS'})
            .then((userOrgArr) => {
              const userIds = userOrgArr.map(orgEle => orgEle.userId);
              User.find({ '_id': userIds})
                  .then((users) => {
                    return res.json({orgDetail, users});
                  });
            });
        })
        .catch(() => {
          return res.status(404).send({message: 'Unauthorised access'});
        });
      })
      .catch(() => {
        return res.status(500).send({message: 'Organization not found'});
      });
}

function addUser(req, res) {
  const userId = req.userId;
  const orgId = req.body.orgId;
  const username = req.body.username;
  if (typeof userId !== 'string' ||
      typeof orgId !== 'string' ||
      typeof username !== 'string') {
        return res.status(500).send({message: 'Request validation failed'});
      }
  let userToAdd;
  isOrgAdmin(userId, orgId)
    .then(() => {
      return Organization.findOne({'_id' : orgId})
        .then(() => {
          return User.findOne({'username': username})
            .then((user) => {
              userToAdd = user;
              return UserOrganization.findOne({'userId': userToAdd._id, 'orgId': orgId})
                .then((existingUser) => {
                    if (existingUser) {
                      return res.status(500).send({message: 'User already exist in this organization'});
                    }
                    const userOrg = new UserOrganization();
                    userOrg.userId = userToAdd._id;
                    userOrg.orgId = orgId;
                    userOrg.roles = ['POS'];
                    return userOrg.save()
                      .then(() => {
                        Organization.update({'_id': orgId}, {$inc: { userCount: 1 }})
                          .then(() => {
                            return res.status(200).send({message: 'User count increased successfully'});
                          })
                          .catch(() => {
                            return res.status(500).send({message: 'Error in increasing user count'});
                          });
                      })
                      .catch(() => {
                        return res.status(500).send({message: 'Error in saving user to organization'});
                      });
                });
            })
            .catch(() => {
              return res.status(500).send({message: 'User not found'});
            });
        })
        .catch(() => {
          return res.status(404).send({message: 'Organization not found'});
        });
      })
      .catch(() => {
        return res.status(500).send({message: 'Unauthorized access'});
      });
}

function deleteOrg(req, res) {
  const userId = req.userId;
  const orgId = req.body.id;
  if (typeof userId !== 'string' ||
      typeof orgId !== 'string') {
        return res.status(500).send({message: 'Request validation failed'});
      }
  isOrgAdmin(userId, orgId)
    .then(() => {
      return UserOrganization.deleteMany({'orgId': orgId})
        .then(() => {
          return Organization.deleteMany({'_id': orgId})
            .then(() => {
              return res.status(200).send({message: 'Organization deleted successfully'});
            })
            .catch(() => {
              return res.status(500).send({message: 'Error in deleting organization'});
            });
        })
        .catch(() => {
          return  res.status(500).send({message: 'Error in deleting UserOrganization'});
        });
    })
    .catch(() => {
      return res.status(404).send({message: 'Unauthorized access'});
    });
}

function removeUser(req, res) {
  const userId = req.userId;
  const userToBeDeleted = req.body.userId;
  const orgId = req.body.orgId;
  if (typeof userId !== 'string' ||
      typeof userId !== 'string' ||
      typeof userId !== 'string') {
        return res.status(500).send({message: 'Request validation failed'});
      }
  isOrgAdmin(userId, orgId)
    .then(() => {
      User.findOne({'_id': userToBeDeleted})
        .then(() => {
          UserOrganization.deleteOne({'userId': userToBeDeleted, 'orgId': orgId})
            .then(() => {
              Organization.update({'_id': orgId}, {$inc: { userCount: -1 }})
                .then(() => {
                  return res.status(200).send({message: 'User removed successfully'});
                })
                .catch(() => {
                  return res.status(500).send({message: 'Error in decreasing user count'});
                });
            })
            .catch(() => {
              return res.status(500).send({message: 'User not found in organization'});
            });
        })
        .catch(() => {
          return res.status(500).send({message: 'User not found'});
        });
    })
    .catch(() => {
      return res.status(404).send({message: 'Unauthorised access'});
    });
}

function updatedOrgDetails(req, res) {
  const userId = req.userId;
  const orgId = req.query.orgId;
  if (typeof userId !== 'string' ||
      typeof orgId !== 'string') {
        res.status(500).send({message: 'Request validation failed'});
      }
  return Organization.findOne({'_id': orgId})
      .then((organization) => {
        res.send(organization.frontendData());
      })
      .catch(() => {
        res.status(500).send({message: 'Organization not found'});
      });
}

// function orgAddUser(req, res) {
//   const userId = req.userId;
//   const orgId = req.body.orgId;
//   const username = req.body.username;
//   if (typeof userId !== 'string' ||
//       typeof orgId !== 'string' ||
//       typeof username !== 'string') {
//         return res.status(500).send({message: 'Request validation failed'});
//       }
//   let userToAdd;
//   isOrgAdmin(userId, orgId)
//     .then(() => {
//       return User.findOne({'username': username});
//     })
//     .catch(() => {
//       return res.status(500).send({message: 'Cannot find user'});
//     })
//     .then((user) => {
//       userToAdd = user;
//       return Organization.findOne({'_id' : orgId});
//     })
//     .catch((error) => {
//       return res.status(500).send({message: error});
//     })
//     .then(() => {
//       return UserOrganization.findOne({'userId': userToAdd._id, 'orgId': orgId});
//     })
//     .catch((err) => {
//       return res.status(500).send({message: 'Cannot find user'});
//     })
//     .then((existingUser) => {
//       if (existingUser) {
//         return res.status(500).send({message: 'User already exist in this organization'});
//       }
//       const userOrg = new UserOrganization();
//       userOrg.userId = userToAdd._id;
//       userOrg.orgId = orgId;
//       userOrg.roles = ['POS'];
//       return userOrg.save();
//     })
//     .catch(() => {
//       return res.status(500).send({message: 'User does not exist in organization'});
//     })
//     .then(() => {
//       Organization.update({'_id': orgId}, {$inc: { userCount: 1 }})
//         .then(() => {
//           return res.status(200).send({message: 'User added successfully'});
//         });
//     })
//     .catch(() => {
//       return res.status(500).send({message: 'Unsuccessful in saving user org'});
//     });
// }
