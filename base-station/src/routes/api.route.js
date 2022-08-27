const express = require('express');
const Station = require('../models/station.model');
const User = require('../models/user.model');
const router = express.Router();

// Api route to get all stations
router.get('/stations', function (req, res) {
    Station.find({}, function (err, docs) {
        if (err) { console.log(err) };
        console.log(docs);
        res.json(docs);
    });
});

module.exports = router;