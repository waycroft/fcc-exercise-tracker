var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var urlParser = bodyParser.urlencoded({extended: true});
var { User } = require(process.cwd() + '/models/User');

router.get('/', async (req, res, next) => {
    let users = await User.find().lean();
    res.send(users);
})

router.post('/', urlParser, async (req, res, next) => {
    let user = new User({
        username: req.body.username
    })
    await user.save();

    res.send(user);
})

module.exports = router;