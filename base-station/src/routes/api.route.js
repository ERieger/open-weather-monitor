const express = require('express');
const Station = require('../models/station.model');
const User = require('../models/user.model');
const Reports = require('../models/report.model');
const bodyParser = require('body-parser');                      // Parse incoming request body to req.body
const router = express.Router();
const Compass = require("cardinal-direction");
const PushNotifications = require("@pusher/push-notifications-server");
const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/config/.env` });

let beamsClient = new PushNotifications({
    instanceId: process.env.BEAMS_INSTANCE_ID,
    secretKey: process.env.BEAMS_SECRET_KEY,
});

router.use(bodyParser.urlencoded({ extended: false }));    // Initialise body parser
router.use(bodyParser.json());

router.post('/deleteReports', function (req, res) {
    try {
        Reports.deleteMany({})
            .then(res.send('Reports successfully deleted.'));
    } catch (e) {
        res.send(e);
    }
});

router.get('/beams-auth', async function (req, res) {
    try {
        let userDoc = await User.findOne({ username: req.session.passport.user });
        const userId = userDoc._id.toString();
        const beamsToken = beamsClient.generateToken(userId);
        console.log(`Generated token ${JSON.stringify(beamsToken)} for ${userId}`)
        res.send(JSON.stringify(beamsToken));
    } catch {
        res.send('User not authenticated!')
    }
});

router.get('/uid', async function (req, res) {
    try {
        let userDoc = await User.findOne({ username: req.session.passport.user });
        const userId = userDoc._id.toString();
        res.send(userId);
    } catch {
        res.send('User not authenticated!')
    }
});

router.get('/lastLogin', async function (req, res) {
    try {
        let doc = await User.findOne({ username: req.session.passport.user });
        res.send(doc.lastLogin);
    } catch {
        res.send('User not authenticated!')
    }
});

router.get('/cookieExpiry', async function (req, res) {
    try {
        res.send(req.session.cookie._expires);
    } catch {
        res.send('User not authenticated!')
    }
})

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

router.post('/toggleFormLoginState', async function (req, res) {
    try {
        let doc = await User.findOne({ username: req.session.passport.user });
        let state = doc.loginWithForm;
        let targetState = undefined;

        if (state) {
            await User.updateOne({ username: req.session.passport.user }, { loginWithForm: false });
            targetState = false;
        } else {
            await User.updateOne({ username: req.session.passport.user }, { loginWithForm: true });
            targetState = true;
        }

        console.log(`State: ${state} Target: ${targetState}`);
        res.send(`Set state ${targetState}`);
    } catch {
        res.send(e)
    }
});

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

router.get('/user', function (req, res) {
    try {
        let user = req.session.passport.user;
        res.send(req.session.passport.user);
    } catch {
        res.send('User not authenticated.')
    }
})

// Api route to get all stations
router.get('/stations', function (req, res) {
    Station.find({}, function (err, docs) {
        if (err) { console.log(err) };
        res.json(docs);
    });
});

router.get('/firstStation', async function (req, res) {
    let stations = await Station.find({});

    for (let i = 0; i < stations.length && stations[i].status != false; i++) {
        res.send(stations[i]);
        break;
    }
});

router.get('/totals', async function (req, res) {
    let obj = req.query;
    let start = obj.start;
    let reports = await Reports.findOne({ stationId: obj.station, time: { $gt: start } });
    res.send(reports);
});

// Api routes to package data for graphs
router.get('/windSpeed', async function (req, res) {
    let obj = req.query;
    let start = obj.start;

    let reports = await Reports.find({ stationId: obj.station, time: { $gt: start } });

    let data = {
        name: 'Wind (km/h)',
        data: (() => {
            let arr = [];
            reports.forEach((report, i) => {
                arr.push({
                    x: report.time,
                    y: report.wind.speed
                });
            });
            return arr;
        })()
    };

    res.send(data);
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

router.get(('/windDirection'), async function (req, res) {
    let obj = req.query;
    let start = obj.start;

    let directionTotals = {
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

    let reports = await Reports.find({ stationId: obj.station, time: { $gt: start } })

    reports.forEach((report, index) => {
        let direction = Compass.cardinalFromDegree(report.wind.direction, Compass.CardinalSubset.Intercardinal);
        directionTotals[direction].push(report.wind.speed);
    });

    for (let property in directionTotals) {
        if (directionTotals[property].length < 1) {
            data.push(0)
            continue;
        } else {
            let average = (() => {
                let sum = 0;
                directionTotals[property].forEach((number) => {
                    sum += number;
                });

                let average = sum / (directionTotals[property].length);
                return average;
            })();
            data.push(average);
        }
    }

    res.send(data);
});

module.exports = router;