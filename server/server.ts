'use strict';
require('dotenv').config();
require('./config');
require('./mongoose-start');
const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const secureCookieController =
    require('./controllers/secure-cookie.controller');
const hostHttpsRedirectController =
    require('./controllers/host-https-redirect.controller');
const socialController = require('./controllers/social.controller');
const tracking = require('./services/tracking.service');
const routes = require('./routes');

const helmet = require('helmet');
app.use(helmet());

app.use(bodyParser.urlencoded({extended: true})); // extended gives full JSON
app.use(bodyParser.json());
app.use(cookieParser());

// Force cookies to be secure by replacing cookie function
app.use(secureCookieController);

app.use(hostHttpsRedirectController);

app.use(socialController);

app.use(tracking.browserIdCookie);

app.use(express.static(path.join(__dirname, '/../dist')));

routes(app);

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '/../dist/index.html'));
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
