const mongoose = require('mongoose');                                   // Module to interact with the database
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');       // Simplify passport and mongoose integration

const Notification = new Schema({});
const User = new Schema({
    username: String,
    password: String,
    config: {
        notifications: [Notification]
    }
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('Notification', Notification);
module.exports = mongoose.model('User', User);
