var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var urlParser = bodyParser.urlencoded({extended: true});
var { User } = require(process.cwd() + '/models/User');

router.get('/', async (req, res, next) => {
    let users = await User.find({}, '-log -__v').lean();
    res.send(users);
})

router.post('/', urlParser, async (req, res, next) => {
    let user = new User({
        username: req.body.username
    })
    await user.save();

    res.send(user);
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

    let returnedUser = await User.findById(req.params.id, '-log -__v').lean();
    returnedUser.description = req.body.description;
    returnedUser.duration = Number(req.body.duration);
    returnedUser.date = date;

    res.send(returnedUser);
})

module.exports = router;