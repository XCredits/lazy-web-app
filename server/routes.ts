const mailingListController =
    require('./controllers/mailing-list.controller');
const authenticationController =
    require('./controllers/authentication.controller');
const statsController =
    require('./controllers/stats.controller');
const profileController =
<<<<<<< HEAD
    require('./controllers/profile-controller.js');
const contactController =
    require('./controllers/contact.controller.ts');
const testapiController =
    require('./controllers/authentication.controller.js');
=======
    require('./controllers/profile-controller');
>>>>>>> pre-release

module.exports = function(app) {
  mailingListController(app);
  authenticationController(app);
  statsController(app);
  profileController(app);
  contactController(app);
  testapiController(app);
};

