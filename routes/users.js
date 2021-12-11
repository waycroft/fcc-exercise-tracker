var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

router.get('/', (req, res, next) => {
    res.send('GET');
})

router.post('/', (req, res, next) => {
    res.send('POST');
})

module.exports = router;