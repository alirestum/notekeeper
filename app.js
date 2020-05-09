const express = require('express');
const bodyParser = require('body-parser');
const app = express();
require('./config/passport');
const db = require('./config/database');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const User = require('./models/User').user;
const Note = require('./models/Note');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
//Init Passport
require('./config/passport')(passport);


//Connect to the database
db.connectToDB;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(flash());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


//Set static files folder
app.use(express.static(__dirname + '/public'));

//Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/user', require('./routes/user'));



//Setting up server and port number
const port = 3000;
app.listen(port, ()=> {
    console.log(`Server is running on port ${port}`);
});




