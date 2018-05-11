// This authentication controller is attempting to achieve best-in-class 
// security and flexibility by:
// 1) Using JWTs to allow for microservices to be authorised without having 
//    access to a session database
// 2) Using JWT Refresh Tokens to allow persistent sessions
// 3) Storing JWT Refresh Tokens such that the refresher can be revoked, meaning
//    compromised tokens will only remaing for a short while after revoking
// 4) Storing JWTs on the client side in HTTP-only, Secure cookies, so 
//    client-side JavaScript can't leak JWTs to some third party, which is 
//    useful if using unverified third-party JavaScript on your site
// 5) Using Cross-site request forgery tokens to ensure that the API routes
//    cannot be exploited by loading URLs on other sites, e.g. 
//    <img src="https://yoursite.com/api/delete-account">
// 6) Because it relies on cookies and built-in Angular XSRF support, no 
//    front-end middleware is required to authenticate the request 
//    (Setting XSRF-TOKEN cookie means that Angular will automatically attach 
//    the XSRF token to the X-XSRF-TOKEN header. Read more:
//         https://stormpath.com/blog/angular-xsrf)
// 7) Passport is used to define the authentication method, so it can be 
//    extended to support all kinds of login methodologies. 
// Read more:
// https://stormpath.com/blog/where-to-store-your-jwts-cookies-vs-html5-web-storage

// Important notes:

// When blocking routes using the authentication controller, the rejection is
// always a 401, which, in the application front-end, forces the app to go to a 
// login form. 
// When a user is logged in, but their privileges do not allow them to access 
// the content, the rejection should always be a 403. This does not result in 
// the user being redirected, instead they are informed that they cannot access
// the content specifed. In some cases, it may be necessary to prevent the user
// from knowing that a resource exists at all. In those cases, it is best to 
// return a 404. 

// It is VERY important, for security reasons, to ensure that GET and HEAD 
// events are not mutating in ANY way (including logging/analytics). The reason 
// for this is that the Angular HTTPClient service does not automatically 
// attach the XSRF Token to the request header that the server has set in the 
// cookie. This means that ALL get requests could potentially be called from any



const User = require('../models/user.model.js');
const Session = require('../models/session.model.js');
const jwt = require('jsonwebtoken');
const auth = require('../config/jwt-auth.js');
const passport = require('passport');
const crypto = require('crypto');
require('../config/passport.js');

module.exports = function (app) {
  app.use(passport.initialize());
  app.post('/api/user/register', register);
  app.post('/api/user/login', login);
  app.get('/api/user/refresh-jwt', auth.jwtRefreshToken, refreshJwt);
  app.get('/api/user/details', auth.jwt, userDetails);
  app.post('/api/user/change-password', auth.jwtRefreshToken, changePassword);
  app.post('/api/user/request-reset-password', requestResetPassword);
  app.post('/api/user/reset-password', auth.jwtTemporaryLinkToken, resetPassword);
  app.post('/api/user/forgot-username', forgotUsername);
  app.post('/api/user/logout', auth.jwtRefreshToken, logout);
}

function register(req, res) {
  // validate

  // check that there is not an existing user with this username
  return User.findOne({username: req.body.username})
      .then(existingUser => {
        if (existingUser){
          return res.status(409).send({message: 'Username already taken.'})
        }
        var user = new User();
        user.givenName = req.body.givenName;
        user.familyName = req.body.familyName;
        user.username = req.body.username;
        user.email = req.body.email;
        user.createPasswordHash(req.body.password);
        return user.save()
            .then(() => {
              return createAndSendRefreshAndSessionJwt(user, req, res);
            })
            .catch(dbError => {
              var err;
              if (process.env.NODE_ENV !== 'production') {
                // DO NOT console.log or return Mongoose catch errors to the front-end in production, especially for user objects. They contain secret information. e.g. if you try to create a user with a username that already exists, it will return the operation that you are trying to do, which includes the password hash.
                err = dbError;
              }
              return res.status(500).send({
                  message: 'Error in creating user during registration: ' + err});
            });
      })
      .catch(()=>{
        res.status(500).send({message:'Error accessing database while checking for existing users'});
      });
}

function login(req, res) {
  passport.authenticate('local', function(err, user, info){
    if (err) {
      return res.status(500).json(err);
    }
    if (!user) {
      auth.clearTokens(res);
      return res.status(401)
          .send({message:"Error in finding user: " + info.message});
    }
    return createAndSendRefreshAndSessionJwt(user, req, res);
  }) (req, res);
}

function refreshJwt(req, res) {
  // The refresh token is verfied by auth.jwtRefreshToken
  // Pull the user data from the refresh JWT
  console.log('Getting into refresher');
  const token = setJwtCookie({
    res,
    userId: req.jwtRefreshToken.sub, 
    username: req.jwtRefreshToken.username,
    isAdmin: req.jwtRefreshToken.isAdmin,
    xsrf: req.jwtRefreshToken.xsrf, 
    sessionId: req.jwtRefreshToken.jwt,
  });

  res.send({
      jwtExp: token.jwtObj.exp,
      message:"JWT successfully refreshed."
  });
}

function userDetails(req, res) {
  return User.findOne({_id: req.userId})
      .then(user => {
        res.send(user.frontendData());
      });
}

function changePassword(req, res) {
  // Attach the user name to the body
  req.body.username = req.jwt.username;
  // Check password
  passport.authenticate('local', function(err, user, info){
    // Create new password hash
    user.createPasswordHash(req.body.newPassword);
    user.save(()=>{
          return res.send({message:'Password successfully changed'});
        })
        .catch(()=>{
          return res.status(500).send({message:'Password change failed'});
        });
  }) (req, res);
}

function requestResetPassword(req, res) {
  return User.findOne({username:req.body.username})
      .then(user=>{
        // Success object must be identical, to avoid people discovering emails in the system
        const successObject = {message: 'Email sent if users found in database.'}
        res.send(successObject); // Note that if errors in sending emails occur, the front end will not see them
        if (!user) {
          return;
        }
        var xsrf;
        if (req.header('X-XSRF-TOKEN')){ //Use existing XSRF if it exists
          xsrf = req.header('X-XSRF-TOKEN')
        } else {
          xsrf = crypto.randomBytes(8).toString('hex');
        }
        const jwtObj = {
          sub: user._id,
          username: user.username,
          isAdmin: user.isAdmin,
          xsrf: xsrf,
          exp: Math.floor(
              (Date.now() + Number(process.env.JWT_TEMPORARY_LINK_TOKEN_EXPIRY))/1000),// 1 hour
        };
        const jwtString = jwt.sign(jwtObj, process.env.JWT_KEY);
        
        console.log(jwtString);
        const emailLink = process.env.URL_ORIGIN + 
            '/password-reset?username=' + user.username + // the username here is only display purposes on the front-end
            '&auth=' + jwtString;
        console.log(emailLink);
        console.log('Email service not set up!!!!!!!!!!!!!!!!!!!!!!');
        // When the user clicks on the link, the app pulls the JWT from the link 
        // and stores it in the JWT_TEMP_AUTH cookie
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send({message:'Error accessing user database.'})
      });
}

function resetPassword(req, res) {
  // Other ideas: https://www.owasp.org/index.php/Forgot_Password_Cheat_Sheet#Step_4.29_Allow_user_to_change_password_in_the_existing_session
  // look up user
  return User.findOne({_id: req.userId}) // req.userId is set in auth.temporaryLinkAuth
      .then(user => {
        user.createPasswordHash(req.body.password);
        return user.save()
            .then(()=>{
              res.send({message:'Password reset successful'});
            });
      })
      .catch(() => {
        res.status(500).send({message:'Error accessing user database.'})
      });
}

function forgotUsername(req, res) {
  // find all users by email
  return User.find({email: req.body.email}).select('username')
      .then(users => {
          // Success object must be identical, to avoid people discovering emails in the system
          const successObject = {message: 'Email sent if users found in database.'}
          res.send(successObject); // Note that if errors in send in emails occur, the front end will not see them
          if (!users) {
            return;
          }
          const usernames = users.map(user => user.username);
          
          console.log(usernames);
          console.log('Email service not set up!!!!!!!!!!!!!!!!!!!!!!');
          // send all user names to email   
          // process.env.URL_ORIGIN
          // return emailService.send({emailAddress: req.body.email, data: usernames})
          //     .catch(() => {
          //     });
      })
      .catch(() => {
        res.status(500).send({message:'Error accessing user database.'})
      });
  
}

function logout(req, res) {
  // get the session from the cookie

  console.log("\n\n\nNeed to check JTI is actually a string\n\n\n");
  
  // delete it from the DB
  return Session.remove({_id: req.jwtRefreshToken.jti})
      .then(()=>{
        // needs a .then to act like a promise for Mongoose Promise
        return null;
      })
      .finally(() => {
        // delete the cookies (note this should not clear the browserId)
        auth.clearTokens(res);
        return res.send({message: 'Log out succesfful'});
      });
}

function createAndSendRefreshAndSessionJwt(user, req, res) {
  console.log("createAndSendRefreshAndSessionJwt");
  // Create cross-site request forgery token
  var xsrf = crypto.randomBytes(8).toString('hex');
  // Setting XSRF-TOKEN cookie means that Angular will automatically attach the 
  // XSRF token to the X-XSRF-TOKEN header. 
  // Read more: https://stormpath.com/blog/angular-xsrf
  console.log('pre save cookie');
  res.cookie('XSRF-TOKEN', xsrf, {secure: !process.env.IS_LOCAL});

  const refreshTokenExpiry = Math.floor(
      (Date.now() + Number(process.env.JWT_REFRESH_TOKEN_EXPIRY))/1000);
  
  console.log(refreshTokenExpiry);
  var session = new Session();
  session.userId = user._id;
  session.exp = new Date(refreshTokenExpiry*1000);
  session.userAgent = req.header('User-Agent').substring(0, 512);;
  session.lastObserved = new Date(Date.now());
  return session.save()
      .then((session)=>{
        console.log('saved session');
        const token = setJwtCookie({
            res,
            userId: user._id, 
            username: user.username,
            isAdmin: user.isAdmin,
            xsrf, 
            sessionId: session._id});
        const refreshToken = setJwtRefreshTokenCookie({
            res,
            userId: user._id, 
            username: user.username,
            isAdmin: user.isAdmin,
            xsrf,
            sessionId: session._id,
            exp: refreshTokenExpiry});
        return res.json({
            user: user.frontendData(), 
            jwtExp: token.jwtObj.exp, 
            jwtRefreshTokenExp: refreshToken.jwtObj.exp,
        });
      })
      .catch((err)=>{
        auth.clearTokens(res);
        return res.status(500).json({message:"Error saving session. " + err});
      });
}

function setJwtCookie({res, userId, username, isAdmin, xsrf, sessionId}) {
  console.log("setJwtCookie");
  var jwtObj = {
    sub: userId,
    // Note this id is set using the refresh token session id so that we can
    // easily determine which session is responisble for an action
    jti: sessionId,
    username: username,
    isAdmin: isAdmin,
    xsrf: xsrf,
    exp: Math.floor((Date.now() + Number(process.env.JWT_EXPIRY))/1000),
  };
  var jwtString = jwt.sign(jwtObj, process.env.JWT_KEY);
  // Set the cookie
  res.cookie('JWT', jwtString, {
      httpOnly: true,
      secure: !process.env.IS_LOCAL,
    });
  return {jwtString, jwtObj};
}

function setJwtRefreshTokenCookie({res, userId, username, isAdmin, xsrf, sessionId, exp}) {
  console.log("setJwtRefreshTokenCookie");
  var jwtObj = {
    sub: userId,
    jti: sessionId,
    username: username,
    isAdmin: isAdmin,
    xsrf: xsrf,
    exp: exp,
  };
  var jwtString = jwt.sign(jwtObj, process.env.JWT_REFRESH_TOKEN_KEY);
  // Set the cookie
  res.cookie('JWT_REFRESH_TOKEN', jwtString, {
      httpOnly: true,
      secure: !process.env.IS_LOCAL,
    });
  return {jwtString, jwtObj};
}