const express = require('express');
const router = express.Router();
const User = require('../models/User').user;
const bcrypt = require('bcrypt');
const passport = require('passport');
const {forwardAuthenticated } = require('../middlewares/authMiddleware');
const {check, validationResult} = require('express-validator');


router.get('/login', forwardAuthenticated, (req, res) => {
    res.render('login');
});


router.post('/login', (req, res, next) => {
    //Passport authentication
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);
});


router.get('/register', forwardAuthenticated, (req, res) => res.render('register', {success_msg: '', errors: null}));


//Username password and passwordconfirm. validation
router.post('/register', [
    check('username').isLength({min: 3}).withMessage('Username must be at least 3 characters long!'),
    check('password').isLength({min: 5}).withMessage('Password must be at least 5 characters long!'),
    check('password2')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords doesn\'t match!')
], async (req, res) => {

    const errors = validationResult(req).array();
    //If the username is already in use add this error to the errors array.
    await User.findOne().where('username').equals(req.body.username).exec().then((user) => {
        if (user != null){
            errors.push({
                value: req.body.username,
                msg: 'This username is already registered. Please log in or choose an other username!'
            });
        }
    });
    //If errors render the page with errors.
    if (errors.length !== 0){
        return res.render('register', {errors: errors, success_msg: ''});
    }

    //Create new user
    let newUser = new User({
        name: req.body.name,
        username: req.body.username,
        password: req.body.password
    });

    //Hash password and save the new user
    bcrypt.genSalt(10, (err, salt) =>{
       bcrypt.hash(newUser.password, salt, (err, hash) =>{
          if (err) throw err;
          newUser.password = hash;
          newUser.save().then(() => {
              res.render('register', {success_msg: 'Successfully registered, please log in!', errors: null});
          }).catch(err => console.log(err));
       });
    });
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/auth/login');
});

router.get('/forgotPassword', (req, res) =>{
   res.render('forgot-password');
});

router.post('/forgotPassword', async(req, res) => {

    await User.findOne().where('username').equals(req.body.username).then((user) =>{
        if (!user){
            res.locals.error = 'No user with that username!';
            res.render('forgot-password');
        } else{
            //Source: https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
            let result           = '';
            let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let charactersLength = characters.length;
            for ( var i = 0; i < 7; i++ ) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            bcrypt.genSalt(10,(err, salt) =>{
               bcrypt.hash(result, salt, (err, hash)=> {
                 User.findOneAndUpdate({username: req.body.username}, {password: hash}).exec();
                   res.locals.newpw = result;
                   res.locals.success_msg = true;
                   res.render('forgot-password');
               }) ;
            });
        }
    });



});

module.exports = router;
