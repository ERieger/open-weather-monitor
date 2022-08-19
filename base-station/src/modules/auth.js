// auth.js - Auth route module.

const express = require('express');
const router = express.Router();

const path = require('path');


// Login page route.
router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../../public/login.html'));
});

module.exports = router;