var mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: String,
    log: [{
        description: String,
        duration: Number,
        date: Number,
    }]
})

const User = mongoose.model('User', UserSchema, 'users');

exports.User = User;