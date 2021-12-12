var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var urlParser = bodyParser.urlencoded({extended: true});
var { User } = require(process.cwd() + '/models/User');

router.get('/', async (req, res, next) => {
    let users = await User.find({}, '-log -__v').lean();
    res.send(users);
})

router.get('/:id/logs', async (req, res, next) => {
    let exerciseLog = await User.aggregate(
        [
            { $addFields: {
                count: {$size: "$log"}
            }},
            { $unset: ["__v"]} // mIGHT need to remove the _id that comes with each exercise. not sure why this is even adding...?
        ])
    res.send(exerciseLog);
})

router.post('/', urlParser, async (req, res, next) => {
    let user = new User({
        username: req.body.username
    })
    await user.save();

    res.send({_id: user._id, username: user.username});
})

router.post('/:id/exercises', urlParser, async (req, res, next) => {
    let date = req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString();

    let writeOp = await User.updateOne({_id: req.params.id}, {
        $push: {
            log: {
                description: req.body.description,
                duration: req.body.duration,
                date: date
            }
        }
    });

    console.log(writeOp);

    // don't like the two roundtrips to mongo but it'll do for now...
    let returnedUser = await User.findById(req.params.id, '-log -__v').lean();
    returnedUser.description = req.body.description;
    returnedUser.duration = Number(req.body.duration);
    returnedUser.date = date;

    res.send(returnedUser);
})

module.exports = router;