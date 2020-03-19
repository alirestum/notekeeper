const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middlewares/authMiddleware');


router.get('/', ensureAuthenticated, (req, res) => res.render('dashboard', {active: 'notes' }));

router.get('/newNote', ensureAuthenticated, (req, res) => {
    res.render('newNote', {active: 'newNote'})
});


module.exports = router;
