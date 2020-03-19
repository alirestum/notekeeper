const express = require('express');
const router = express.Router();

router.get('/profile', (req, res, next) =>{
   res.send(req.user);
});

module.exports = router;
