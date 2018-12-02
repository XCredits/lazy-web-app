'use strict';
require('dotenv').config();
require('./server/config');
require('./server/mongoose-start');
const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const _ = require('lodash');
const socialController = require('./server/controllers/social.controller');
const tracking = require('./server/services/tracking.service');
const routes = require('./server/routes');

const helmet = require('helmet');
app.use(helmet());

app.use(bodyParser.urlencoded({extended: true})); // extended gives full JSON
app.use(bodyParser.json());
app.use(cookieParser());

// Force cookies to be secure by replacing cookie function
app.use(function(req, res, next) {
  if (process.env.SECURE_COOKIES === 'TRUE') {
    return function(req, res, next) {
      let cookieFunction = res.cookie;
      res.cookie = function(name, value, options) {
        let newOptions = {};
        if (typeof options !== 'undefined') {
          newOptions = _.cloneDeep(options);
        }
        if (typeof newOptions.secure === 'undefined') {
          newOptions.secure = isSecureCookies;
        }
        return cookieFunction.call(res, name, value, newOptions);
      };
      next();
    };
  }
  return next();
});

app.use('/', function(req, res, next) {
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
});

app.use(socialController);

app.use(tracking.browserIdCookie);

app.use(express.static(path.join(__dirname, 'dist')));

routes(app);

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.post('*', function(req, res) {
  res.status(404).json({message: 'Route not found.'});
});

const port = process.env.PORT || '3000';
app.set('port', port);

const server = http.createServer(app);

server.listen(port, function() {
  console.log(`Running on localhost:${port}`);
});
