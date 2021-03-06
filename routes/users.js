var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var urlParser = bodyParser.urlencoded({extended: true});
var { User } = require(process.cwd() + '/models/User');

async function getFullExerciseLog(userId) {
    return await User.aggregate(
        [ 
            { $match: {
                _id: userId
            }},
            { $project: {
                count: {$size: "$log"},
            }},
            // { $unset: "log._id"}
        ])
}

/**
 * 
 * @param {string} userId 
 * @param {{from: number, to: number, limit: number}} options 
 * @returns user object with filtered exercise log as array
 * 
 * Filters a user's exercise log given a from date, to date, and a limit (quantity). 
 */
async function getFilteredExerciseLog(userId, options) {
    let {from, to, limit} = options;

    return await User.aggregate(
        [ 
            { $match: {
                _id: userId
            }},
            { $project: {
                log: { $filter: {
                        input: "$log",
                        cond: {$and: [ { $gte: ["$$this.date", from]}, {$lt: ["$$this.date", to]} ]}
                    },
                },
                // not sure why I can't include this $slice in the log object above, but doing it in a separate operation prevents the MongoServerError I was getting...
                // log: {$slice: ["$log", limit]},
                count: {$size: "$log"},
            }},
            { $unset: "log._id"}
        ])
}

router.get('/', async (req, res, next) => {
    let users = await User.find({}, '-log -__v').lean();
    res.send(users);
})

router.get('/:id/logs', async (req, res, next) => {
    let userId = req.params.id;

    let options = {
        from: new Date(req.query.from).getTime(),
        to: new Date(req.query.to).getTime(),
        limit: Number(req.query.limit) || 100,
    }

    let exerciseLog;

    // might just scrap the aggregation stuff and do object manipulation...

    if (isNaN(options.from) || isNaN(options.to) || isNaN(options.limit)) {
        exerciseLog = await getFullExerciseLog(userId);
        res.send(exerciseLog);
        return;
    }

    exerciseLog = await getFilteredExerciseLog(userId, options);
    res.send(exerciseLog);

    // for (let i = 0; i < exerciseLog[0].log; i++) {
    //     if (!logItemWithinLimits) delete exerciseLog[0].log[]
    // }
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
    returnedUser.date = new Date(date).toDateString();

    res.send(returnedUser);
})

module.exports = router;