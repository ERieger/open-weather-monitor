const express = require('express');
const app = express();
const port = 3000;

const path = require('path');

// Serve static public content
app.use(express.static('./static'));

// Import custom modules
const auth = require('./modules/auth.js');
app.use('/login', auth);

// Index page route.
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`)
});