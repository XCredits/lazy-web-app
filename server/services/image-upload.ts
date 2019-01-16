const multer  = require('multer');
const path_image = require('path');
// Local Disk Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path_image.join(__dirname, '..', '..', 'src/assets/images/'));
  },
  filename: function(req, file, cb) {
    const ext = file.mimetype.split('/')[1];
    cb(null, 'IMAGE-' + Date.now() +  '.' + ext);
  }
});

const upload = multer({ storage });

module.exports = upload;

// GCS
const multerGoogleStorage = require('multer-google-storage');

const uploadGCS = multer({
    // The selection between GCS and AWS is made using the .env file and the
    // config.ts file.
    storage: multerGoogleStorage.storageEngine({
      acl: 'publicread',
      bucket: process.env.GCS_BUCKET,
    }),
});

module.exports = uploadGCS;

// AWS
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');

const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only JPEG and PNG is allowed!'), false);
  }
};

const uploadAWS = multer({
  fileFilter,
  storage: multerS3({
    acl: 'public-read',
    s3: s3,
    bucket: process.env.AWS_BUCKET,
    metadata: function(req, file, cb) {
      cb(null, {fieldName: 'Testing_Metadata'});
    },
    key: function(req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
});

module.exports = uploadAWS;
