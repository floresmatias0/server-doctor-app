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

const getPatients = require('./patients/get.patient.js');
const postPatients = require('./patients/post.patient.js');
const putPatients = require('./patients/put.patient.js');

const getSymptoms = require('./symptoms/get.symptom.js');
const postSymptoms = require('./symptoms/post.symptom.js');

const postCertificates = require('./certificates/post.certificates.js');

const upload = require('../middlewares/multer.middleware.js');
const { isAuthenticated } = require('../middlewares/auth.middleware.js');

const router = Router();

// Configuramos los routers
router.use('/users', isAuthenticated, getUsers);
router.use('/users', isAuthenticated, postUsers);
router.use('/users', isAuthenticated, putUsers);

router.use('/auth', getAuth);

router.use('/calendars', isAuthenticated, getCalendars);
router.use('/calendars', isAuthenticated, postCalendars);
router.use('/calendars', isAuthenticated, deleteCalendars);

router.use('/payments', isAuthenticated, getPayments);
router.use('/payments', isAuthenticated, postPayments);

router.use('/patients', isAuthenticated, getPatients);
router.use('/patients', isAuthenticated, postPatients);
router.use('/patients', isAuthenticated, putPatients);

router.use('/symptoms', isAuthenticated, getSymptoms);
router.use('/symptoms', isAuthenticated, postSymptoms);

router.use('/certificates', upload, postCertificates)


module.exports = router;