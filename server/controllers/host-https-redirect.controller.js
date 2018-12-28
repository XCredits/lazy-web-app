'use strict';

module.exports = function(req, res, next) {
  let redirect = false;
  // Redirect non-https
  if (req.headers['x-forwarded-proto'] === 'http' && // if using http
      req.hostname !== 'localhost') { // & not a local install
    if (req.method === 'GET') { // if it is a GET request
      redirect = true;
    } else { // if it is a POST, DELETE etc
      // Throw an error
      return res.status(400)
          .send({message: 'Do not make API requests using http, use https'});
    }
  }
  // Remove www
  let strippedHostname = req.hostname;
  if (strippedHostname.startsWith('www.')) {
    strippedHostname = strippedHostname.slice(4);
  }
  if (redirect) {
    return res.redirect('https://' + strippedHostname + req.originalUrl);
  }
  next();
};
