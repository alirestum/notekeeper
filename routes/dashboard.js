const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middlewares/authMiddleware');


router.get('/', ensureAuthenticated, (req, res) => res.send('Welcome' + req.user.name));



module.exports = router;
