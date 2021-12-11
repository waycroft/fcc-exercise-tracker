var mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: String,
    exercises: [{
        description: String,
        duration: Number,
        date: String,
    }]
})

const User = mongoose.model('User', UserSchema, 'users');

exports.User = User;