// Import modules
const express = require('express');                             // Server
const mongoose = require('mongoose');                           // Module to interact with the database
const bodyParser = require('body-parser');                      // Parse incoming request body to req.body
const MongoStore = require('connect-mongo');                    // Store session data in mongo
const passport = require('passport');                           // Authentication middleware
const session = require('express-session');                     // Session management
const connectEnsureLogin = require('connect-ensure-login');     // Handle page access to authenticated users
const { v4: uuidv4 } = require('uuid');                         // Module to generate uuids
const path = require('path');                                   // Interact with file paths
const cron = require('node-cron');                              // Require CRON scheduler

const dotenv = require('dotenv');                               // Require env library
dotenv.config({ path: `${__dirname}/config/.env` });            // Set env location

// Import custom modules
const auth = require('./routes/auth.route');
const api = require('./routes/api.route')
const User = require('./models/user.model');
const Reports = require('./models/report.model');
const Station = require('./models/station.model');
const Session = require('./models/session.model');
const Notification = require('./models/notification.model');
const subscriber = require('./middleware/mqttSubscriber');

// Initialise app
const app = express();                      // Define app
app.set('views', __dirname + '/views');     // Views directory
app.set('view engine', 'pug');              // Set view engine

// Connect to database - load values form environment variables
mongoose.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`, {
  dbName: process.env.MONGO_DATABASE,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Set reference to static files
app.use('/static', express.static(path.join(__dirname, '../public/static')));
app.use('/js', express.static(path.join(__dirname, '../public/static/js')));
app.use('/css', express.static(path.join(__dirname, '../public/static/css')));
app.use('/assets', express.static(path.join(__dirname, '../public/static/assets')));
app.use('/images', express.static(path.join(__dirname, '../public/static/assets/images')));

// Initialise session
app.use(session({
  genid: (req) => {
    let uuid = uuidv4();
    return uuid; // TODO: This needs to be validated to check it doesn't exist
  },
  secret: process.env.COOKIE_KEY,
  store: MongoStore.create({
    client: mongoose.connection.getClient(),
    dbName: process.env.MONGO_DATABASE
  }),
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000, secure: false },    // 1 hour, allow http
}));

app.use('/api', api);                                   // Api routes

app.use(bodyParser.urlencoded({ extended: false }));    // Initialise body parser
app.use(passport.initialize());                         // Initialise passport
app.use(passport.session());                            // Initialise session

// Intialise passport
passport.use(User.createStrategy());                    // Passport local strategy (authentication method)
passport.serializeUser(User.serializeUser());           // Serialize
passport.deserializeUser(User.deserializeUser());       // Deserialize

// Server configuration
const config = require("./config/config");              // Load config json
const port = config.port;                               // Get selected server port

// Function to register a new user
// User.register({ username: 'erieger', active: false }, 'test');
// Station.create({
//     'stationId': uuidv4(),
//     'name': 'Adelaide Airport',
//     'lastUpdate': 'Fri Aug 26 2022 14:03:11 GMT+0930 (Australian Central Standard Time)',
//     'loc': {
//         'lat': -34.94207364350075, 
//         'lon': 138.53519808818888
//     },
//     status: false,
//     'sensors': ['temperature', 'humidity', 'windSpeed', 'windDirection', 'pressure', 'rainfall', 'light'],
//     'battery': 98
// }, function (err, small) {
//   if (err) return handleError(err);
//   // saved!
// });

// Routing
app.get('/', (req, res) => {            // Homepage
  res.render('./index.pug');
});

app.get('/settings', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  res.render(path.join('./settings.pug'));
});

app.use('/login', auth);                // Login routes

// Authenticate users
app.post('/authenticate', passport.authenticate('local', { failureRedirect: '/login', failureMessage: true }),
  function (req, res) {
    User.updateOne({ username: req.session.passport.user }, { loginWithForm: true }, function (err, docs) {
      if (err) { console.log(err) }
      else { console.log("Updated Docs : ", docs) }
    });
    res.redirect('/dashboard');
  });

// Logout users
app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

// Dashboard (ensures auth state)
app.get('/dashboard', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  const sendData = () => { res.render(path.join('./dashboard.pug'), pageData) };

  let stations = await Station.find({});
  let reports = await Reports.find({});

  let pageData = {
    stations: stations
  }

  sendData();
});

app.get('/authtest', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
  res.send(`Hello ${req.user.username}. Your session ID is ${req.sessionID} 
   and your session expires in ${req.session.cookie.maxAge} 
   milliseconds.<br><br>
   <a href="/logout">Log Out</a><br><br>`);
});

app.get('/service-worker.js', (req, res) => {
  res.sendFile('service-worker.js', { root: './base-station/public/static/js/' });
});

// Start server listening on selected port
app.listen(port, () => {
  console.log(`App listening on port ${port}!`)
});
