const mailingListController =
    require('./controllers/mailing-list.controller');
const authenticationController =
    require('./controllers/authentication.controller');
const statsController =
    require('./controllers/stats.controller');
const profileController =
    require('./controllers/profile-controller');
const contactController =
    require('./controllers/contact.controller');
const testapiController =
    require('./controllers/authentication.controller');
const connectionController =
    require('./controllers/connection-request.controller');

module.exports = function(app) {
  mailingListController(app);
  authenticationController(app);
  statsController(app);
  profileController(app);
  contactController(app);
  testapiController(app);
  connectionController(app);
};

