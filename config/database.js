const mongoose = require('mongoose');
const db = require('./keys').MongoURI;

module.exports.connectToDB = mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('Connected to the DB!'))
    .catch(err => console.log(err));

