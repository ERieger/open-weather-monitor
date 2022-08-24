// auth.js - Auth route module.

const express = require('express');
const router = express.Router();


// Login page route.
router.get('/', function (req, res) {
  res.render('./login.pug');
});


module.exports = router;