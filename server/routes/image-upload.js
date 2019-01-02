const express = require('express');
const router = express.Router();
const auth = require('../controllers/jwt-auth.controller');

const upload = require('../services/image-upload');

const singleUpload = upload.single('image');

router.post('/image-upload', auth.jwtRefreshToken, function(req, res) {
  singleUpload(req, res, function(err) {
    if (err) {
      return res.status(422).send({errors: [{title: 'Image upload error', detail: err.message}]});
    }

    return res.json({'imageUrl': req.file.location});
  });
});

module.exports = router;

