// GCS
const multer = require('multer');
const multerGoogleStorage = require('multer-google-storage');

const uploadHandler = multer({
    // fileFilter,
    storage: multerGoogleStorage.storageEngine({
      acl: 'publicread',
    }),
});

module.exports = uploadHandler;

// AWS

// const aws = require('aws-sdk');
// const multer = require('multer');
// const multerS3 = require('multer-s3');
// const configure = require('../config/image');

// aws.config.update({
//   secretAccessKey: configure.AWS_SECRET_ACCESS_KEY,
//   accessKeyId: configure.AWS_ACCESS_KEY_ID,
//   region: 'us-east-2',
// });

// const s3 = new aws.S3();

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//     cb(null, true);
//   } else {
//     cb(new Error('Invalid file type, only JPEG and PNG is allowed!'), false);
//   }
// };

// const maxSize = 1 * 1000 * 1000;
// const upload = multer({
//   fileFilter,
//   storage: multerS3({
//     acl: 'public-read',
//     s3: s3,
//     bucket: 'app-ng-dev',
//     metadata: function(req, file, cb) {
//       cb(null, {fieldName: 'Testing_Metadata'});
//     },
//     key: function(req, file, cb) {
//       cb(null, Date.now().toString());
//     },
//   }),
//   limits: {fileSize: maxSize},
// });

// module.exports = upload;
