const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const routes = require('./routes/index.js');
const passport = require('./middlewares/passport.middleware.js');

const server = express();

server.name = 'API';

server.use(express.urlencoded({ extended: true, limit: '250mb' }));
server.use(express.json({ limit: '250mb' }));

server.use(cors());
server.set('trust proxy', 1) // trust first proxy
server.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

server.use('/v1/', routes);
server.use('/uploads', express.static(path.join(__dirname, '../uploads')));

server.use(passport.initialize());
server.use(passport.session());

// Error catching endware.
server.use((err, req, res, next) => { 
  const status = err.status || 500;
  const message = err.message || err;
  console.error(err);
  res.status(status).send(message);
});

module.exports = server;