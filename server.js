require('dotenv').config();

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const csrf = require('csurf');
const auth = require('./middleware/authenticate');

const mongoose = require('mongoose');
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost/cooldown-visualizer'
);
// mongoose.set('useFindAndModify', false);

const db = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const csrfProtection = csrf({ cookie: true });

require('./routes/api')(app, db, auth, csrfProtection);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, './client/build')));
}

if (process.env.NODE_ENV === 'production') {
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '/client/build/index.html'));
  });
}

app.listen(PORT, function() {
  console.log('listening to requests on port ' + PORT);
  console.log('http://localhost:' + PORT);
});
