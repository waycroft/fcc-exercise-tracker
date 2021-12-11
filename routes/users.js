var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var urlParser = bodyParser.urlencoded({extended: true});

router.get('/', (req, res, next) => {
    res.send('GET');
})

router.post('/', urlParser, (req, res, next) => {
    res.send({username: req.body.username});
})

module.exports = router;