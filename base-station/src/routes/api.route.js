const express = require('express');
const Station = require('../models/station.model');
const User = require('../models/user.model');
const Reports = require('../models/report.model');
const bodyParser = require('body-parser');                      // Parse incoming request body to req.body
const router = express.Router();
const Compass = require("cardinal-direction");

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