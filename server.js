const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('connected to mongoDB');
})
.catch(error => {
  console.log({'uh oh': 'could not connect to mongoDB', error: error})
});

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

var usersRouter = require(process.cwd() + '/routes/users');
app.use('/api/users', usersRouter);


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
