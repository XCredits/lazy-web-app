const Organization = require('../models/organization.model');
const UserOrganization = require('../models/user-organization.model');
const auth = require('./jwt-auth.controller');
const User = require('../models/user.model');
const UsernameCheck = require('../models/username.model');

import {uploadSingleImage} from '../services/image-upload';

module.exports = function(app) {
  app.post('/api/organization/create', auth.jwt, createOrg);
  app.post('/api/organization/user-org-summary', auth.jwt, userOrgSummary);
  app.post('/api/organization/get-details', auth.jwt, getDetails);
  app.post('/api/organization/update-details', auth.jwt, updateDetails);
  app.post('/api/organization/image-upload', auth.jwt, imageUpload);
  app.post('/api/organization/add-user', auth.jwt, addUser);
  app.post('/api/organization/delete', auth.jwt, deleteOrg);
  app.post('/api/organization/remove-user', auth.jwt, removeUser);
  app.post('/api/organization/get-users', auth.jwt, getUsers);
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
  console.log(name, website, phoneNumber, username);
  const userId = req.userId;
  if (typeof userId !== 'string' ||
      typeof name !== 'string' ||
      typeof website !== 'string' ||
      typeof phoneNumber !== 'string' ||
      typeof username !== 'string') {
    return res.status(500).send({message: 'Request validation failed'});
  }
  const organization = new Organization();
  organization.name = name;
  organization.website = website;
  organization.phoneNumber = phoneNumber;
  organization.userCount = 1;
  const userOrg = new UserOrganization();
  return organization.save()
      .then(() => {
        console.log('Inside');
        userOrg.userId = userId;
        userOrg.orgId = organization._id;
        userOrg.roles = ['admin'];
        return userOrg.save()
            .then(() => {
                const usernameCheck = new UsernameCheck();
                usernameCheck.username = username;
                usernameCheck.refId = organization._id;
                usernameCheck.type = 'Organization';
                usernameCheck.current = true;
                return usernameCheck.save()
                    .then(() => {
                      res.status(200).send({
                          message: 'UserId and OrganizationId saved successfully'
                      });
                    })
                    .catch(() => {
                      res.status(500).send({message: 'Error in saving username'});
                    });
            })
            .catch(() => {
              res.status(500).send({
                message: 'Error in Saving user role and organization.'
            });
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send({message: 'Error in saving organization'});
      });
}

function userOrgSummary(req, res) {
  const userId = req.userId;
  if (typeof userId !== 'string') {
    return res.status(500).send({message: 'Request validation failed'});
  }
  let userOrg;
  return UserOrganization.find({'userId': userId})
      .then((userOrgArr) => {
        const orgIds = userOrgArr.map(orgEle => orgEle.orgId);
        userOrg = userOrgArr;
        return UsernameCheck.find({ 'refId': { '$in': orgIds}})
            .then((orgUsername) => {
              return Organization.find({ '_id': { '$in': orgIds}})
                .then((orgDetails) => {
                  return res.json({orgDetails, userOrg, orgUsername});
                })
                .catch(() => {
                  return res.status(500).send({message: 'Error in finding organization'});
                });
            })
            .catch(() => {
              return res.status(500).send({message: 'Error in finding username'});
            });
      })
      .catch(() => {
        return res.status(500).send({message: 'Error in finding userId'});
      });
}

function updateDetails(req, res) {
  const userId = req.userId;
  const orgId = req.body.id;
  const name = req.body.name;
  const website = req.body.website;
  const phoneNumber = req.body.phoneNumber;
  const username = req.body.username;
  console.log(username);
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
              return org.save()
                  .then(() => {
                    return UsernameCheck.findOne({'refId': orgId, 'current': true})
                        .then((response) => {
                          if (response.username === username) {
                            return res.status(200).send({message: 'Updated successfully'});
                          }
                          response.current = false;
                          return response.save()
                              .then(() => {
                                const usernameCheck = new UsernameCheck();
                                usernameCheck.username = username;
                                usernameCheck.refId = response.refId;
                                usernameCheck.current = true;
                                usernameCheck.type = 'Organization';
                                return usernameCheck.save()
                                    .then(() => {
                                      return res.status(200).send({
                                        message: 'Organization details updated successfully'
                                      });
                                    })
                                    .catch((err) => {
                                      return res.status(500).send({
                                          message: 'Error in saving organization username'
                                      });
                                    });
                              })
                              .catch(() => {
                                return res.status(500).send({message: 'Error in saving old username'});
                              });
                        })
                        .catch((err) => {
                          return res.status(500).send({
                            message: 'Error in finding organization username'
                        });
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
  return UsernameCheck.findOne({'username': username})
    .then((response) => {
      isOrgAdmin(userId, response.refId)
        .then(() => {
            return Organization.findOne({_id: response.refId})
                .then((orgDetail) => {
                  return res.json({orgDetail, response});
                })
                .catch(() => {
                  return res.status(500).send({message: 'Organization not found'});
                });
        })
        .catch(() => {
          return res.status(500).send({message: 'Unauthorized access'});
        });
    })
    .catch(() => {
      return res.status(500).send({message: 'Organization username not found'});
    });
}

function getUsers(req, res) {
  const userId = req.userId;
  const username = req.body.username;
  if (typeof userId !== 'string' ||
      typeof username !== 'string') {
    return res.status(500).send({message: 'Request validation failed'});
    }
  return UsernameCheck.findOne({'username': username})
      .then((response) => {
        return Organization.findOne({'_id': response.refId})
          .then((organization) => {
              return isOrgAdmin(userId, organization._id)
                .then(() => {
                  return UserOrganization
                    .find({'orgId': organization._id, 'roles': 'POS'})
                        .then((userOrgArr) => {
                            const userIds =
                                  userOrgArr.map(orgEle => orgEle.userId);
                            return UsernameCheck.find({'refId': userIds})
                                .then((users) => {
                                    return res.send(users);
                                })
                                .catch(() => {
                                  return res.status(500).send({
                                    message: 'Error in finding users'
                                  });
                                });
                        })
                        .catch((err) => {
                          return res.status(500).send({
                            message: 'Error in finding userIds'
                          });
                        });
                })
                .catch(() => {
                  return res.status(500).send({message: 'Unauthorized access'});
                });
          })
          .catch(() => {
            return res.status(500).send({message: 'Organization not found'});
          });
      })
      .catch(() => {
        return res.status(500).send({message: 'Organization username is invalid'});
      });
}

function addUser(req, res) {
  const userId = req.userId;
  const orgId = req.body.orgId;
  const username = req.body.username;
  console.log(userId, orgId, username);
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
          return UsernameCheck.findOne({'username': username, 'type': 'user'})
            .then((response) => {
              return User.findOne({'_id': response.refId})
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
              return res.status(500).send({message: 'Username not found'});
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
