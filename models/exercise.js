var mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
    username: String,
    description: String,
    duration: Number,
    date: String,
})

const Exercise = mongoose.model('Exercise', ExerciseSchema, 'Exercises');

exports.Exercise = Exercise;