const crypto = require('crypto');

/**
 * Middleware for globally setting browserId
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

module.exports = {
  browserIdCookie: function(req, res, next) {
    if (req.cookies.browserId) {
      res.cookie('browserId', crypto.randomBytes(10).toString('hex'));
    }
    next();
  },
};
