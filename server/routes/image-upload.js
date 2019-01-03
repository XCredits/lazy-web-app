const express = require('express');
const app = express.Router();
const User = require('../models/user.model.js');
const auth = require('../controllers/jwt-auth.controller');

const upload = require('../services/image-upload');

const singleUpload = upload.single('image');

app.post('/image-upload', auth.jwtRefreshToken, function(req, res) {
    const userId = req.userId;
    if ( typeof userId !== 'string') {
      return res.status(422).json({message: 'UserID not found'});
    }
    singleUpload(req, res, function(err) {
      if (err) {
        return res.status(422).send({errors: [{title: 'Image upload error', detail: err.message}]});
      }
      User.findOne({_id: userId})
          .then((user)=>{
            user.profileImage = req.file.location;
            return user.save()
            .then(() => {
              return res.send({message: 'Image Uploaded Successfully'});
            })
            .catch((err) => {
              return res.status(500).send({message: 'Error in Uploading Images'});
            });
          });
    });
});

module.exports = app;

