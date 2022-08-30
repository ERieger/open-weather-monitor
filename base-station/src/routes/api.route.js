const express = require('express');
const Station = require('../models/station.model');
const User = require('../models/user.model');
const Reports = require('../models/report.model');
const bodyParser = require('body-parser');                      // Parse incoming request body to req.body
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));    // Initialise body parser
router.use(bodyParser.json());

// Api route to get all stations
router.get('/stations', function (req, res) {
    Station.find({}, function (err, docs) {
        if (err) { console.log(err) };
        res.json(docs);
    });
});

router.get('/firstStation', async function (req, res) {
    let stations = await Station.find({});
    // console.log(stations);

    for (let i = 0; i < stations.length && stations[i].status != false; i++) {
        // console.log(stations[i]);
        res.send(stations[i]);
    }
});

// Api routes to package data for graphs
router.post('/windSpeed', async function (req, res) {
    const start = req.body.start;
    console.log(start);

    let reports = await Reports.find({ stationId: req.body.station, time: {$gt: start} });

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

router.post('/temperature', async function (req, res) {
    const start = req.body.start;
    console.log(start);

    let reports = await Reports.find({ stationId: req.body.station, time: {$gt: start}});

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

router.post('/humidity', async function (req, res) {
    const start = req.body.start;

    let reports = await Reports.find({ stationId: req.body.station, time: {$gt: start}});

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

router.post('/rainfall', async function (req, res) {
    const start = req.body.start;
    console.log(start);

    let reports = await Reports.find({ stationId: req.body.station, time: {$gt: start}});

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

module.exports = router;