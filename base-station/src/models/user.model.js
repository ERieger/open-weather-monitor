const mongoose = require('mongoose');                                   // Module to interact with the database
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');       // Simplify passport and mongoose integration

const User = new Schema({
    username: String,
    password: String,
    lastLogin: Date,
    loginWithForm: Boolean
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
