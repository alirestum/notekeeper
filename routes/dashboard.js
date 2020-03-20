const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../middlewares/authMiddleware');
const User = require('../models/User').user;
const Note = require('../models/Note');
const {check, validationResult} = require('express-validator');
const Attachment = require('../models/Attachment');


//To see any pages under dashboard the user must be authenticated.
router.get('/*', ensureAuthenticated);

/*

#################### Multiple note methods and routes ####################

 */

router.get('/', async (req, res) => {
    //Get the notes of the current user
    let userNotes = [];
    await User.findOne().where('username').equals(req.user.username).then(async (user) => {
        await Note.find().where('owner').equals(user._id).then((notes) => {
            userNotes = notes;

        });
    });
    //Convert mongo data to date
    userNotes.forEach((note) => {
        note.lastModified = new Date(note.lastModified);
    });

    res.locals.notes = userNotes;
    //Render the page
    res.render('dashboard', {active: 'notes'});
});


router.get('/tag', async (req, res) => {
    //Find the current user
    await User.findOne().where('username').equals(req.user.username).then(async (user) => {
        //Find the users notes
        await Note.find().where('owner').equals(user._id).then((notes) => {
            //Modify query parameter and filter the notes
            let responseNotes = notes.filter((note) => {
                return note.tags.includes('#' + req.query.tag);
            });
            res.locals.notes = responseNotes;
            //Render the page
            res.render('dashboard', {active: ''});
        });
    });

});

/*

#################### Single note methods and routes ####################

 */

router.get('/note/:noteId', (req, res) => {
    //Find the note with the specified id
    Note.findOne().where('noteId').equals(req.params.noteId).then((note) => {
        Attachment.find().where('note').equals(note._id).then((attachments) => {
            note.attachments = attachments;
            res.render('note', {active: '', note: note});
        });
    });

});

router.get('/newNote', (req, res) => {
    res.locals.errors = null;
    res.render('newNote', {active: 'newNote'})
});

router.post('/newNote',
    //Note name cant be empty
    check('noteName').notEmpty().withMessage('Note name can\'t be empty!'),
    async (req, res) => {
        //If errors render the errors
        res.locals.errors = validationResult(req).array();
        if (res.locals.errors.length !== 0) return res.render('newNote', {active: 'newNote'});
        //Split the tags
        let tags = req.body.tags.split(' ');
        //Create new note Object
        let newNote = new Note({
            owner: req.user._id,
            name: req.body.noteName,
            content: req.body.content,
            lastModified: Date.now(),
            tags: tags
        });
        //Save the new note and render the page
        newNote.save().then(() => {
            res.locals.successfulSave = true;
            res.locals.errors = null;
            res.render('newNote', {active: 'newNote'});
        });
    });


router.get('/editNote', async (req, res) => {
    //Find the note by ID and render the page with the data
    await Note.findOne().where('noteId').equals(req.query.noteId).then((note) => {
        res.render('edit-note', {active: '', note: note, success_msg: false});
    });

});

router.post('/editnote', async (req, res) => {

    //Get the new data from the form
    const filter = {noteId: req.query.noteId};
    const tags = req.body.tags.split(' ');
    const update = {
        name: req.body.noteName,
        content: req.body.content,
        lastModified: Date.now(),
        tags: tags
    };

    //Save the new data
    await Note.findOneAndUpdate(filter, update).then((note) => {
        res.render('edit-note', {active: '', note: note, success_msg: true});
    });
});


router.get('/removeNote', async (req, res) => {

    //Find the note and delete it
    await Note.findOneAndDelete({noteId: req.query.noteId}).then(async () => {
        //Find the current user
        await User.findOne().where('username').equals(req.user.username).then(async (user) => {
            //Find the notes of the user
            await Note.find().where('owner').equals(user._id).then((notes) => {
                res.locals.notes = notes;
                //Render the "new" notes
                res.render('dashboard', {active: 'notes'});
            });
        });
    });

});
/*

#################### Attachment methods and routes ####################

 */

router.get('/attachments/new', (req, res) => {
    res.locals.errors = null;
    //Set noteId for when the user submits posts it can be read in the post route
    res.locals.noteId = req.query.noteId;
    res.render('new-attachment', {active: '', success_msg: false});
});

router.post('/attachments/new',
    check('name').notEmpty().withMessage('Attachment must have a name!'),
    async (req, res) => {

    //If errors render the errors
    res.locals.errors = validationResult(req).array();
        if (res.locals.errors.length !== 0) return res.render('new-attachment', {active: '', success_msg: false});

        let newAttachment = new Attachment({
            name: req.body.name,
            url: req.body.url
        });

        //Find the note which the attachment should belong to.
        await Note.findOne().where('noteId').equals(req.query.noteId).then((note) => {
            newAttachment.note = note._id;
            //Save the attachment and update the notes array about the attachments
            newAttachment.save().then((newAttachment) => {
                Note.findOneAndUpdate({_id: note._id}, {$push: {attachments: newAttachment._id}})
                    .then(() => {
                        res.locals.errros = null;
                        res.render('new-attachment', {active: '', success_msg: true});
                    })
            })
        });

    });

router.get('/attachments/delete', (req, res) => {
    //I don't know what is happening here. It was very late in the evening (morning?)....
    //BUT IT WORKS. I'm almost 100% percent there is an easier way to remove an attachment.
    Note.findOne().where('noteId').equals(req.query.noteId).then((note) =>{
           Attachment.findOne({note: note._id, name: req.query.attachmentName}).then((attachment) => {
              Note.findOneAndUpdate({noteId: note.noteId}, {$pull: {attachments: attachment._id}})
                  .then(() =>{
                     Attachment.findOneAndDelete({name: attachment.name, note: note._id})
                         .then(() => {
                             Note.findOne().where('noteId').equals(req.query.noteId)
                                 .then((editedNote) => {
                                     Attachment.find().where('note').equals(editedNote._id)
                                         .then((attachments) => {
                                         editedNote.attachments = attachments;
                                         res.render('note', {active: '', note: editedNote});
                                     });
                                 });
                         });
                  });
           });
        });
});


module.exports = router;
