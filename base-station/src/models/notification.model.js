const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Notification = new Schema({
    'field': Array,
    'condition': String,
    'trigger': Number,
    'subscribers': Array
});

module.exports = mongoose.model('Notification', Notification);
