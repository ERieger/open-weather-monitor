const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Station = new Schema({
    stationId: String,
    name: String,
    lastUpdate: Date,
    loc: {
        lat: Number,
        lon: Number
    },
    status: Boolean,
    sensors: [String],
    battery: Number
});

module.exports = mongoose.model('Station', Station);
