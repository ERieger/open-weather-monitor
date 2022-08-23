const express = require('express');
const app = express();
const port = 3000;

const path = require('path');



// Set reference to static files
app.use('/static', express.static(path.join(__dirname, '../public/static')));
app.use('/js', express.static(path.join(__dirname, '../public/static/js')));
app.use('/css', express.static(path.join(__dirname, '../public/static/css')));
app.use('/assets', express.static(path.join(__dirname, '../public/static/assets')));
app.use('/images', express.static(path.join(__dirname, '../public/static/assets/images')));

// Set template engine
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');



// Import custom modules
const auth = require('./modules/auth.js');
app.use('/login', auth);



// Index page route.
app.get('/', function (req, res) {
  res.render(path.join('./index.pug'));
});

app.listen(port, function () {
  console.log(`App listening on port ${port}!`)
});