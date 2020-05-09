const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middlewares/authMiddleware');


router.get('/', ensureAuthenticated, (req, res) => res.redirect(301, '/dashboard'));

    module.exports = router;
