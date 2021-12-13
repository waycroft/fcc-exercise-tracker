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
    let from = new Date(req.query.from).getTime();
    let to = new Date(req.query.to).getTime();
    let limit = Number(req.query.limit);

    let exerciseLog = await User.aggregate(
        [ 
            { $project: {
                log: {
                    // including this with filter causes: MongoServerError: Invalid $project :: caused by :: FieldPath field names may not start with '$'.
                    // $slice: ["$log", limit],
                    $filter: {
                        input: "$log",
                        cond: { $and: [ {$gte: ["$$this.date", from]}, {$lte: ["$$this.date", to]} ]}
                    },
                },
                count: {$size: "$log"},
            }},
        ])

    // for (let i = 0; i < exerciseLog[0].log; i++) {
    //     if (!logItemWithinLimits) delete exerciseLog[0].log[]
    // }
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
    let date = req.body.date ? new Date(req.body.date).getTime() : new Date().getTime();

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
    returnedUser.date = new Date(date).toDateString();

    res.send(returnedUser);
})

module.exports = router;