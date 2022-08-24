const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Session = new Schema({
    'expires': String,
    'session': String
});

module.exports = mongoose.model('Session', Session);