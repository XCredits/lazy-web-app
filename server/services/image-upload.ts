const multer  = require('multer');
const pathi = require('path');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const crypt = require('crypto');

 // The selection between GCS and AWS is made using the .env file and the
 // config.ts file.
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
    console.log(process.env.IMAGE_SERVICE);
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only JPEG and PNG is allowed!'), false);
  }
};

// // Local Disk Storage
if (process.env.IMAGE_SERVICE === 'localDisk') {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, pathi.join(__dirname, '..', '..', 'src/assets/images/'));
    },
    filename: function(req, file, cb) {
      const ext = file.mimetype.split('/')[1];
      const array = new Uint32Array(1);
      crypt.randomFillSync(array);
      cb(null, 'img-' + Date.now() + '-' +  array[0] + '.' + ext);
    }
  });
  const upload = multer({
    fileFilter,
    storage });
  module.exports = upload;
} else if (process.env.IMAGE_SERVICE === 'gcs') {
    const multerGoogleStorage = require('multer-google-storage');

    const uploadGCS = multer({
      fileFilter,
      storage: multerGoogleStorage.storageEngine({
        acl: 'publicread',
        bucket: process.env.GCS_BUCKET,
      }),
    });
    module.exports = uploadGCS;
} else {
  const s3 = new aws.S3();

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
}
