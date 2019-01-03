'use strict';
const _ = require('lodash');

module.exports = function(req, res, next) {
  if (req.hostname !== 'localhost') {
    const cookieFunction = res.cookie;
    res.cookie = function(name, value, options) {
      let newOptions: any = {};
      if (typeof options !== 'undefined') {
        newOptions = _.cloneDeep(options);
      }
      if (typeof newOptions.secure === 'undefined') {
        newOptions.secure = true;
      }
      return cookieFunction.call(res, name, value, newOptions);
    };
  }
  return next();
};
