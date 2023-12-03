const firebase = require("firebase/app");

const express = require('express');
const session = require('express-session');
const cors = require('cors');

const firebaseConfig = require('../firebase.config.js');
firebase.initializeApp(firebaseConfig);

const routes = require('./routes/index.js');
const passport = require('./middlewares/passport.middleware.js');

const server = express();
server.name = 'API';

server.use(express.urlencoded({ extended: true, limit: '250mb' }));
server.use(express.json({ limit: '250mb' }));

server.use(cors({
  origin: '*',
  credentials: true
}));

server.set('trust proxy', 1) // trust first proxy

const isProduction = process.env.ENVIRONMENT === 'production';

server.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: isProduction
  }
}));

server.use(passport.initialize());
server.use(passport.session());

server.use('/v1/', routes);
// server.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// Error catching endware.
server.use((err, req, res, next) => { 
  const status = err.status || 500;
  const message = err.message || err;
  console.error(err);
  res.status(status).send(message);
});

module.exports = server;