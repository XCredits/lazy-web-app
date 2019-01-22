'use strict';
require('dotenv').config();
require('./config');
require('./mongoose-start');
import * as express from 'express';
const app = express();
import * as path from 'path';
import * as http from 'http';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
const secureCookieController =
    require('./controllers/secure-cookie.controller');
const hostHttpsRedirectController =
    require('./controllers/host-https-redirect.controller');
const socialController = require('./controllers/social.controller');
const tracking = require('./services/tracking.service');
const routes = require('./routes');

import * as helmet from 'helmet';
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

if (process.env.IMAGE_SERVICE === 'local') {
  app.use(express.static(process.env.LOCAL_IMAGE_SAVE_LOCATION_ABSOLUTE));
}

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
