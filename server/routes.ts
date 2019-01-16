const mailingListController =
    require('./controllers/mailing-list.controller');
const authenticationController =
    require('./controllers/authentication.controller');
const statsController =
    require('./controllers/stats.controller');
const profileController =
    require('./controllers/profile-controller');

module.exports = function(app) {
  mailingListController(app);
  authenticationController(app);
  statsController(app);
  profileController(app);
};

