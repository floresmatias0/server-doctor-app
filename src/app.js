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

const whitelist = [
  'http://localhost:5173',
  'https://front-doctor-app.vercel.app',
  'https://www.zonapediatrica.com.ar',
  'https://zonapediatrica.com.ar',
  'https://zw89lvvh-5173.brs.devtunnels.ms',
  'https://0tsm88jn-5173.brs.devtunnels.ms',
  'https://zw89lvvh.brs.devtunnels.ms:5173',
  'https://www.zonamed.com.ar',
  'https://zonamed.com.ar'
];

const corsOptionsDelegate = function (req, callback) {
  let corsOptions;

  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true, credentials: true };
  } else {
    corsOptions = { origin: false }
  }

  callback(null, corsOptions)
}

server.use(cors(corsOptionsDelegate));

server.set('trust proxy', 1)

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

server.use((err, req, res, next) => { 
  const status = err.status || 500;
  const message = err.message || err;
  console.error(err);
  res.status(status).send(message);
});

module.exports = server;