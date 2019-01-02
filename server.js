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
const secureCookieController =
    require('./server/controllers/secure-cookie.controller');
const hostHttpsRedirectController =
    require('./server/controllers/host-https-redirect.controller');
const socialController = require('./server/controllers/social.controller');
const tracking = require('./server/services/tracking.service');
const routes = require('./server/routes');

const imageUploadRoutes = require('./server/routes/image-upload');
app.use('/api', imageUploadRoutes);

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
