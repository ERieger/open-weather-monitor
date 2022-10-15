const express = require('express');                                     // Import express
const Station = require('../models/station.model');                     // Station schema
const User = require('../models/user.model');                           // User schema
const Notification = require('../models/notification.model');           // Notification schema
const Reports = require('../models/report.model');                      // Report schema
const bodyParser = require('body-parser');                              // Parse incoming request body to req.body
const router = express.Router();                                        // Initialise express router
const Compass = require("cardinal-direction");                          // Import cardinal directions library
const PushNotifications = require("@pusher/push-notifications-server"); // Import push notifications server library
const dotenv = require('dotenv');                                       // Import environment variables
const notifications = require('../middleware/notifications');           // Import notifications middleware
dotenv.config({ path: `${__dirname}/config/.env` });                    // Set .env location

let beamsClient = new PushNotifications({                               // Initialise beams client
    instanceId: process.env.BEAMS_INSTANCE_ID,                          // Load instance id from env
    secretKey: process.env.BEAMS_SECRET_KEY,                            // Load secret key from env
});

router.use(bodyParser.urlencoded({ extended: false }));                 // Initialise body parser for forms
router.use(bodyParser.json());                                          // Body parser for json

router.post('/deleteReports', function (req, res) {                     // Route to delete reports
    try {                                                               // Try this
        Reports.deleteMany({})                                          // Clear reports collection
            .then(res.send('Reports successfully deleted.'));           // Return success message
    } catch (e) {                                                       // Catch error
        res.send(e);                                                    // Return error
    }
});

router.post('/addNotification', async function (req, res) {             // Add a notification
    try {                                                               // Try this
        req.body.field = (() => {                                       // Parse the field array to an array
            let arr = [];
            if (!Array.isArray(req.body['field[]'])) {                  // If it is not an array (only one value gets parsed to string)
                req.body['field[]'] = [req.body['field[]']];            // Make it a single item array
            }
            req.body['field[]'].forEach((field) => {                    // If it is an array loop through the array
                arr.push(field);                                        // Push the values to the array
            });
            delete req.body['field[]']                                  // Delete the bad field
            return arr;                                                 // Return the cleaned array
        })();

        req.body.subscribers = (() => {                                 // Does the same thing as the previous function but for subscribers
            let arr = [];
            if (!Array.isArray(req.body['subscribers[]'])) {
                req.body['subscribers[]'] = [req.body['subscribers[]']];
            }
            req.body['subscribers[]'].forEach((subscriber) => {
                arr.push(subscriber);
            });
            delete req.body['subscribers[]']
            return arr;
        })();

        let doc = await Notification.create(req.body);                  // Push notification to the database

        console.log('Added notification:' + doc);
        res.json({ message: 'Successfully added!', id: doc._id })       // Send confirmation mesage
    } catch (e) {                                                       // Catch errors
        res.send(e);                                                    // Send error as repsonse
    }
});

router.post('/toggleNotification', function (req, res) {                // Toggle notification
    req.body.state = req.body.state == 'true';                          // Parse boolean string to boolean
    console.log(`Toggling notification ${req.body.notification} for user ${req.body.user} to state ${req.body.state}`);

    if (req.body.state) {                                               // If subscribing
        console.log('Subscribing.')
        // Push the user's id to the subscribers array int he database
        Notification.updateOne({ _id: req.body.notification }, { "$push": { "subscribers": `${req.body.user}` } }, function (err, docs) {
            if (err) {                                                  // Catch and log errors
                console.log(err)
            }
            else {                                                      // Success!
                console.log("Updated Docs : ", docs);
                res.send('Successfully subscribed.');                   // Send subscription message
            }
        });
    } else {                                                            // Same as above but it pulls your ID from the array
        console.log('Unsubscribing.')
        Notification.updateOne({ _id: req.body.notification }, { "$pull": { "subscribers": `${req.body.user}` } }, function (err, docs) {
            if (err) {
                console.log(err)
            }
            else {
                console.log("Updated Docs : ", docs);
                res.send('Successfully unsubscribed.')
            }
        });
    }
});


// Returns the notification collection
router.get('/getNotifications', async function (req, res) {
    let docs = await Notification.find({});
    res.json(docs);
});

router.post('/unameFromId', async (req, res) => {                           // Get your username from your ID
    try {                                                                   // Try this
        let doc = await User.findOne({ _id: req.body.id }, 'username');     // Search DB for user ID, return username
        res.json({ username: doc.username });                               // Send response
    } catch (e) {                                                           // Oh no! An error!
        res.send(e)                                                         // Return the error
    }
})

router.post('/deleteNotification', async (req, res) => {                    // Delete a notification
    try {                                                                   // Try this
        await Notification.deleteOne({ _id: req.body.notification })        // Delete the notification from the database by the id
        res.send(`Successfully deleted ${req.body.notification}`);          // Send success message
    } catch (e) {                                                            // Catch errors
        res.send(e);                                                        // Send error as response
    }
});

router.get('/beams-auth', async function (req, res) {                                   // Beams auth key endpoint
    try {                                                                               // Try this
        let userDoc = await User.findOne({ username: req.session.passport.user });      // Find the userID by the request username
        const userId = userDoc._id.toString();                                          // Extract the documetn ID as a string
        const beamsToken = beamsClient.generateToken(userId);                           // Generate a beams token
        console.log(`Generated token ${JSON.stringify(beamsToken)} for ${userId}`)
        res.send(JSON.stringify(beamsToken));                                           // Send the token as a JSON
    } catch {                                                                           // Catch errors
        res.send('User not authenticated!')                                             // Error user not authenticated
    }
});

router.get('/uid', async function (req, res) {                                          // Get the user's id from the request username
    try {                                                                               // Try this
        let userDoc = await User.findOne({ username: req.session.passport.user });      // Get the user document from the database by the username
        const userId = userDoc._id.toString();                                          // Extract the user ID
        res.send(userId);                                                               // Send the ID back to the client
    } catch {                                                                           // Catch errors
        res.send('User not authenticated!')                                             // Error user not authenticated
    }
});

router.get('/lastLogin', async function (req, res) {                                    // Get the last login attempt
    try {                                                                               // Try this
        let doc = await User.findOne({ username: req.session.passport.user });          // Find the user id from the database by the request username
        res.send(doc.lastLogin);                                                        // Send response
    } catch {                                                                           // Catch errors
        res.send('User not authenticated!')                                             // Error user not authenticated
    }
});

// Return the cookie expiry time from the request object
router.get('/cookieExpiry', async function (req, res) {
    try {
        res.send(req.session.cookie._expires);
    } catch {
        res.send('User not authenticated!')
    }
});

// Comine the last few requests into one for efficiency - See above comments
router.get('/authInfo', async function (req, res) {
    try {
        let doc = await User.findOne({ username: req.session.passport.user });

        res.json({
            lastLogin: doc.lastLogin,
            cookieExpiry: req.session.cookie._expires,
            loginWithForm: doc.loginWithForm
        });
    } catch {
        res.send('User not authenticated!')
    }

});

router.post('/toggleFormLoginState', async function (req, res) {                                        // Toggle form login state
    try {                                                                                               // Try this
        let doc = await User.findOne({ username: req.session.passport.user });                          // Get user document by username 
        let state = doc.loginWithForm;                                                                  // Extract current state
        let targetState = undefined;                                                                    // Target state

        if (state) {                                                                                    // If you just logged in
            await User.updateOne({ username: req.session.passport.user }, { loginWithForm: false });    // Set redirect from form false
            targetState = false;
        } else {                                                                                        // If you were not logged in
            await User.updateOne({ username: req.session.passport.user }, { loginWithForm: true });     // Set redirect from form true
            targetState = true;
        }

        console.log(`State: ${state} Target: ${targetState}`);
        res.send(`Set state ${targetState}`);                                                           // Return target state
    } catch {                                                                                           // Catch errors
        res.send(e);                                                                                    // Return errors
    }
});

// Update the user's last login time with their local time parsed through the request body
router.post('/updateLastLogin', async function (req, res) {
    try {
        User.updateOne({ username: req.session.passport.user }, { lastLogin: new Date(req.body.lastLogin) }, function (err, docs) {
            if (err) { console.log(err) }
            else { console.log("Updated Docs : ", docs) }
        });
        res.send('Updated last login.');
    } catch {
        res.send('User not authenticated!')
    }
});

// Get user's auth state based on username
router.get('/user', function (req, res) {
    try {
        let user = req.session.passport.user;
        res.send(req.session.passport.user);        // Return username if authenticated
    } catch {
        res.send('User not authenticated.')         // Catch errors
    }
})

// Api route to get all stations
router.get('/stations', function (req, res) {
    Station.find({}, function (err, docs) {
        if (err) { console.log(err) };
        res.json(docs);
    });
});

// Get the first active station in the database
router.get('/firstStation', async function (req, res) {
    let stations = await Station.find({});

    for (let i = 0; i < stations.length && stations[i].status != false; i++) {      // Loop through stations till it finds the first active one
        res.send(stations[i]);                                                      // Send it!
        break;
    }
});

// Return the most recent report for a select station in a time scale
router.get('/totals', async function (req, res) {
    let obj = req.query;
    let start = obj.start;
    let reports = await Reports.findOne({ stationId: obj.station, time: { $gt: start } });
    res.send(reports);
});

// Api routes to package data for graphs
// This is the same for all the graphs so I will only comment one
router.get('/windSpeed', async function (req, res) {
    let obj = req.query;
    let start = obj.start;

    let reports = await Reports.find({ stationId: obj.station, time: { $gt: start } });     // Find all reports in timescale for certain station

    let data = {                                                                            // Package the returned reports for apex chart
        name: 'Wind (km/h)',                                                                // Set the name of the chart
        data: (() => {
            let arr = [];
            reports.forEach((report, i) => {                                                // Loop through all the reports
                arr.push({                                                                  // Push the report to an array
                    x: report.time,                                                         // Time of the report
                    y: report.wind.speed                                                    // Value of the field
                });
            });
            return arr;                                                                     // Return the packaged array
        })()
    };

    res.send(data);                                                                         // Send the apex chart data
});

router.get('/temperature', async function (req, res) {
    let obj = req.query;
    let start = obj.start;

    let reports = await Reports.find({ stationId: obj.station, time: { $gt: start } });

    let data = {
        name: 'Temperature (°C)',
        data: (() => {
            let arr = [];
            reports.forEach((report, i) => {
                arr.push({
                    x: report.time,
                    y: report.temperature
                });
            });

            return arr;
        })()
    };

    res.send(data);
});

router.get('/humidity', async function (req, res) {
    let obj = req.query;
    let start = obj.start;

    let reports = await Reports.find({ stationId: obj.station, time: { $gt: start } });
    console.log({ stationId: req.body.station, time: { $gt: start } });

    let data = {
        name: 'Humidity (%)',
        data: (() => {
            let arr = [];
            reports.forEach((report, i) => {
                arr.push({
                    x: report.time,
                    y: report.relHumidity
                });
            });

            return arr;
        })()
    };

    res.send(data);
});

router.get('/rainfall', async function (req, res) {
    let obj = req.query;
    let start = obj.start;

    let reports = await Reports.find({ stationId: obj.station, time: { $gt: start } });

    let data = {
        name: 'Rainfall (mm)',
        data: (() => {
            let arr = [];
            reports.forEach((report, i) => {
                arr.push({
                    x: report.time,
                    y: report.rainfall
                });
            });

            return arr;
        })()
    };

    res.send(data);
});

// This graph is special
// It calculates the average windspeed for each direction from all the reports parsed
router.get(('/windDirection'), async function (req, res) {
    let obj = req.query;
    let start = obj.start;

    let directionTotals = { // Define an object property for each cardinal direction with an array
        N: [],
        NNE: [],
        NE: [],
        ENE: [],
        E: [],
        ESE: [],
        SE: [],
        SSE: [],
        S: [],
        SSW: [],
        SW: [],
        WSW: [],
        W: [],
        WNW: [],
        NW: [],
        NNW: []
    }
    let data = [];

    let reports = await Reports.find({ stationId: obj.station, time: { $gt: start } }) // Get all reports for station in timescale

    reports.forEach((report, index) => { // For each report
        // Convert the degree into cardinal diretion to intercardinal accuracy
        let direction = Compass.cardinalFromDegree(report.wind.direction, Compass.CardinalSubset.Intercardinal);
        directionTotals[direction].push(report.wind.speed);             // Push the windspeed to the appropriate direction
    });

    for (let property in directionTotals) {                             // For each direction in the object
        if (directionTotals[property].length < 1) {                     // If there are no reports in the property
            data.push(0)                                                // Push 0 to it
            continue;
        } else {                                                        // If there is
            let average = (() => {
                let sum = 0;
                directionTotals[property].forEach((number) => {         // Loop through the array
                    sum += number;                                      // Sum the total
                });

                let average = sum / (directionTotals[property].length); // Average the speed for that direction
                return average;                                         // Return the average
            })();
            data.push(average);                                         // Push the value to data array
        }
    }

    res.send(data);                                                     // Return the array of average speed for each direction
});

module.exports = router;