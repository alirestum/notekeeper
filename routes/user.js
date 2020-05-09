const express = require('express');
const router = express.Router();
const User = require('../models/User').user;
const Attachment = require('../models/Attachment');
const Note = require('../models/Note');
const {check, validationResult} = require('express-validator');
const {ensureAuthenticated} = require('../middlewares/authMiddleware');
const bcrypt = require('bcrypt');

router.get('/*', ensureAuthenticated);

router.get('/profile', async (req, res) => {

   //Find current user and render the page with current user data.
    await User.findOne().where('username').equals(req.user.username).then((user) => {
        res.render('profile', {active: 'profile', user: user, success_msg: '', errors: null});
    });


});

router.post('/profile', [
        check('username').isLength({min: 3}).withMessage('Username must be at least 3 characters long!'),
        check('password').notEmpty().withMessage('Please write in your current password!'),
        check('password').isLength({min: 5}).withMessage('Password must be at least 5 characters long!'),
        check('password2')
            .custom((value, {req}) => value === req.body.password)
            .withMessage('Passwords doesn\'t match!')
    ],
    async (req, res) => {

        const errors = validationResult(req).array();

        //If password field is empty remove the password length error from the error list.
        const notEmptyError = 'Please write in your current password!';
        const lengthError = 'Password must be at least 5 characters long!';
        let filteredErrors = [];
        if (errors.filter(e => e.msg === notEmptyError).length > 0
            && errors.filter(e => e.msg === lengthError).length > 0) {
            filteredErrors = errors.filter((e) => {
                return e.msg !== lengthError
            });
        }

        //If the username is already occupied generate an error message.
        await User.findOne().where('username').equals(req.body.username).then((user) => {
            if (user != null && user.username !== req.user.username) {
                errors.push({
                    value: req.body.username,
                    msg: 'This username is already in use. Please choose an another username!'
                });
            }
        });

        //If errors, return the errors and render the page with the errors.
        if (errors.length !== 0) {

            const returnErrors = filteredErrors.length === 0 ? errors : filteredErrors;
            return res.render('profile', {
                active: 'profile',
                errors: returnErrors,
                success_msg: false,
                user: req.user
            });
        }

        //Create filter, get data from the form and hash the new password.
        const filter = {username: req.user.username};
        let update = {
            name: req.body.name,
            username: req.body.username,
            password: ''
        };
        await bcrypt.genSalt(10, async (err, salt) => {
            await bcrypt.hash(req.body.password, salt, (err, hash) => {
                if (err) throw err;
                update.password = hash;
               //Update the database entry
               User.findOneAndUpdate(filter, update).then((user) => {
                    res.render('profile', {active: 'profile', errors: null, success_msg: true, user: user});
                });
            });
        });
    });


router.post('/profile/deleteProfile', async (req, res) => {
    //Find notes and attachments of the user and delete them.
    await User.findOne().where('username').equals(req.user.username).populate('notes').then(async (user) =>{
        await user.notes.forEach( async (note) => {
            await Note.findOne().where('noteId').equals(note.noteId).populate('attachments').then(async (note) =>{
                note.attachments.forEach(async (atch) =>{
                   await Attachment.findOneAndDelete({_id: atch._id}).exec();
                });
            });
        });
           /* */

        await Note.deleteMany({owner: user._id}).exec();
    });

    //Find user and delete
    await User.findOneAndDelete({username: req.user.username}).exec();

    res.render('login');
});

module.exports = router;
