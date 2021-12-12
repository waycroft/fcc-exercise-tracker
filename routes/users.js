var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var urlParser = bodyParser.urlencoded({extended: true});
var { User } = require(process.cwd() + '/models/User');

router.get('/', async (req, res, next) => {
    let users = await User.find().lean();
    users = users.map(userObj => {
        return {_id: userObj._id, username: userObj.username};
    })
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

    let user = await User.findOneAndUpdate({_id: req.params.id}, {
        $push: {
            log: {
                description: req.body.description,
                duration: req.body.duration,
                date: date
            }
        }
    }, {new: true});

    res.send(user);
})

module.exports = router;