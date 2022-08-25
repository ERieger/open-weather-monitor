const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Report = new Schema({
    'stationId': String,
    'wind': {
        'speed': Number,
        'direction': Number,
        'gust': Number,
        'gustDirection': Number
    },
    'rainfall': Number,
    'temperature': Number,
    'pressure': Number,
    'relHumidity': Number,
    'light': Number,
    'system': {
        'battery': Number
    }
});

module.exports = mongoose.model('Report', Report);