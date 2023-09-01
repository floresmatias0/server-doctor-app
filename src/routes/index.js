const { Router } = require('express');

//Importamos los routers
const getUsers = require('./users/get.user.js');
const postUsers = require('./users/post.user.js');
const putUsers = require('./users/put.user.js');

const getAuth = require('./auth/get.auth.js');

const getCalendars = require('./calendars/get.calendars.js');
const postCalendars = require('./calendars/post.calendars.js');
const deleteCalendars = require('./calendars/delete.calendars.js');

const getPayments = require('./payments/get.payments.js');
const postPayments = require('./payments/post.payments.js');


const router = Router();

// Configuramos los routers
router.use('/users', getUsers);
router.use('/users', postUsers);
router.use('/users', putUsers);

router.use('/auth', getAuth);

router.use('/calendars', getCalendars);
router.use('/calendars', postCalendars);
router.use('/calendars', deleteCalendars);

router.use('/payments', getPayments);
router.use('/payments', postPayments);


module.exports = router;