/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');

const upload = multer({ dest: path.join(__dirname, 'uploads') });

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.example' });

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const websiteController = require('./controllers/website');
const apiController = require('./controllers/api');
const contactController = require('./controllers/contact');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/**
 * Express configuration.
 */

//node-cron
var cron = require('node-cron');
var Request = require("request");
//var Monitor = require('ping-monitor');
var sslChecker = require('ssl-checker');
var checkBrokenLinks = require('check-broken-links')

const ping = require('./ping');

var JSONReport = new mongoose.Schema({
  json: String,
  insertAt: Date
});


//SHIV Remove This Comment After Develop Admin Panel
var IsSchedulerStarted = false;
//var IsSchedulerStarted = true;
var JSONReport = mongoose.model("JSONReport", JSONReport);
var task;



app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
  store: new MongoStore({
    url: process.env.MONGODB_URI,
    autoReconnect: true,
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  if (req.path === '/api/upload') {
    next();
  } else {
    lusca.csrf()(req, res, next);
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.disable('x-powered-by');
app.use((req, res, next) => {
  if (req.user && req.user.profile.listofwebsites != '' && req.user.profile.scaninterval > 0) {
    if (!IsSchedulerStarted) {
      //Start Node-Crons Jobs
      console.log('Start Node-Crons Jobs');

      var listofwebsites = req.user.profile.listofwebsites;
      listofwebsites = listofwebsites.split(',');

      //Start Ping Task
      ping.pingWebsite(listofwebsites,req.user.profile.scaninterval);

      task = cron.schedule(req.user.profile.scaninterval + ' * * * * *', () => {
        console.log('running a task every ' + req.user.profile.scaninterval + 'Seconds');
        for (var i = 0; i < listofwebsites.length; i++) {
          if (listofwebsites[i] == '') continue;
          console.log('Task running for website=' + listofwebsites[i]);
          // //Ping Task Started
          // const myWebsite = new Monitor({
          //   website: listofwebsites[i],
          //   interval: 10
          // });
          // myWebsite.on('up', function (res) {
          //   console.log('Yay!! ' + res.website + ' is up.');
          // });


          // myWebsite.on('down', function (res) {
          //   console.log('Oh Snap!! ' + res.website + ' is down! ' + res.statusMessage);
          // });


          // myWebsite.on('stop', function (website) {
          //   console.log(website + ' monitor has stopped.');
          // });
          // //Ping Task End


          //SSL Check Task Start
          sslChecker(listofwebsites[i], ).then(res => {

             var JSONReportData = new JSONReport({ json: JSON.stringify(res), insertAt: new Date() });
              JSONReportData.save()
                .then(item => {
                  console.log("item saved to database for sslChecker");
                })
                .catch(err => {
                  console.log("unable to save to database for sslChecker", err);
              });
            
            console.log(res)
          }).catch(error => {
            console.log(error);
          });
          //SSl Check Task End

          //check-broken-links Task Start

          const containsBroken = [
            'https://' + listofwebsites[i] + '/',
          ]
          checkBrokenLinks('https://' + listofwebsites[i] + '/', containsBroken).then(brokenlinks => {
            console.log('brokenlinks Success')
            console.log(brokenlinks)
            /*
            { top: [ { url: 'https://www.iAMbroken.com', err: [Object] } ],
              crawled:
              [ { link: 'https://iwasinside.com/iCONTAINbrokenlinks ',
                  sources: [ 'https://iwasfoundinthislinkyou supplied.com', 'https://butalsointhisone.com' ] }
              ] },
              allchecked: { [ link: '', sources: [] ] } // This would obviously be populated
            */
          }).catch(error => {
            console.log('Error In checkBrokenLinks');
            console.log(error);
          })

          //check-broken-links Task End


          //Request Website and Save Response Task Started
          Request.get('https://content.googleapis.com/pagespeedonline/v5/runPagespeed?url=http://' + listofwebsites[i] + '&key=AIzaSyCpGJZ0vg7LMu7o4om1VjNJHBFeqwOpZmA', (error, response, body) => {
            if (error) {
              return console.dir(error);
            }
            console.log('Page speed insignts API run for :' + req.user.profile.listofwebsites);
            // console.dir(response);
            console.dir('data Fetched from API');
            var JSONReportData = new JSONReport({ json: JSON.stringify(response), insertAt: new Date() });
            JSONReportData.save()
              .then(item => {
                console.log("item saved to database");
              })
              .catch(err => {
                console.log("unable to save to database", err);
              });
          });

          //Request Website and Save Response Task End


        }





      });
      IsSchedulerStarted = true;
    }
  }
  else {
    IsSchedulerStarted = false;
    if (task != null && task != undefined) {
      console.log('Destroy running node-crons job');
      task.destroy();
    }
  }

  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user
    && req.path !== '/login'
    && req.path !== '/signup'
    && !req.path.match(/^\/auth/)
    && !req.path.match(/\./)) {
    req.session.returnTo = req.originalUrl;
  } else if (req.user
    && (req.path === '/account' || req.path==='/website' || req.path.match(/^\/api/))) {
    req.session.returnTo = req.originalUrl;
  }
  next();
});
app.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/popper.js/dist/umd'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/jquery/dist'), { maxAge: 31557600000 }));
app.use('/webfonts', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.get('/website', passportConfig.isAuthenticated, websiteController.getWebsite);
app.post('/website', passportConfig.isAuthenticated, websiteController.postWebsite);
app.delete('/website/:id', passportConfig.isAuthenticated, websiteController.deleteWebsite);
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);

/**
 * API examples routes.
 */
app.get('/api', apiController.getApi);
app.get('/api/lastfm', apiController.getLastfm);
app.get('/api/nyt', apiController.getNewYorkTimes);
app.get('/api/aviary', apiController.getAviary);
app.get('/api/steam', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getSteam);
app.get('/api/stripe', apiController.getStripe);
app.post('/api/stripe', apiController.postStripe);
app.get('/api/scraping', apiController.getScraping);
app.get('/api/twilio', apiController.getTwilio);
app.post('/api/twilio', apiController.postTwilio);
app.get('/api/clockwork', apiController.getClockwork);
app.post('/api/clockwork', apiController.postClockwork);
app.get('/api/foursquare', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFoursquare);
app.get('/api/tumblr', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getTumblr);
app.get('/api/facebook', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);
app.get('/api/github', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getGithub);
app.get('/api/twitter', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getTwitter);
app.post('/api/twitter', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.postTwitter);
app.get('/api/linkedin', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getLinkedin);
app.get('/api/instagram', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getInstagram);
app.get('/api/paypal', apiController.getPayPal);
app.get('/api/paypal/success', apiController.getPayPalSuccess);
app.get('/api/paypal/cancel', apiController.getPayPalCancel);
app.get('/api/lob', apiController.getLob);
app.get('/api/upload', apiController.getFileUpload);
app.post('/api/upload', upload.single('myFile'), apiController.postFileUpload);
app.get('/api/pinterest', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getPinterest);
app.post('/api/pinterest', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.postPinterest);
app.get('/api/google-maps', apiController.getGoogleMaps);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get('/auth/instagram', passport.authenticate('instagram'));
app.get('/auth/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/linkedin', passport.authenticate('linkedin', { state: 'SOME STATE' }));
app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});

/**
 * OAuth authorization routes. (API examples)
 */
app.get('/auth/foursquare', passport.authorize('foursquare'));
app.get('/auth/foursquare/callback', passport.authorize('foursquare', { failureRedirect: '/api' }), (req, res) => {
  res.redirect('/api/foursquare');
});
app.get('/auth/tumblr', passport.authorize('tumblr'));
app.get('/auth/tumblr/callback', passport.authorize('tumblr', { failureRedirect: '/api' }), (req, res) => {
  res.redirect('/api/tumblr');
});
app.get('/auth/steam', passport.authorize('openid', { state: 'SOME STATE' }));
app.get('/auth/steam/callback', passport.authorize('openid', { failureRedirect: '/api' }), (req, res) => {
  res.redirect(req.session.returnTo);
});
app.get('/auth/pinterest', passport.authorize('pinterest', { scope: 'read_public write_public' }));
app.get('/auth/pinterest/callback', passport.authorize('pinterest', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/api/pinterest');
});

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Server Error');
  });
}

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
