const { Router } = require('express');

//Importamos los routers
const getUsers = require('./users/get.user.js');
const postUsers = require('./users/post.user.js');
const putUsers = require('./users/put.user.js');

const getAuth = require('./auth/get.auth.js');

const getCalendars = require('./calendars/get.calendars.js');
const postCalendars = require('./calendars/post.calendars.js');


const router = Router();

// Configuramos los routers
router.use('/users', getUsers);
router.use('/users', postUsers);
router.use('/users', putUsers);

router.use('/auth/google', getAuth);

router.use('/calendars', getCalendars);
router.use('/calendars', postCalendars);


module.exports = router;