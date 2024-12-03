const { Router } = require('express');

//Importamos los routers
const getUsers = require('./users/get.user.js');
const postUsers = require('./users/post.user.js');
const putUsers = require('./users/put.user.js');
const deleteUsers = require('./users/delete.user.js');

const getAuth = require('./auth/get.auth.js');

const getCalendars = require('./calendars/get.calendars.js');
const postCalendars = require('./calendars/post.calendars.js');
const patchCalendars = require('./calendars/put.calendars.js');
const deleteCalendars = require('./calendars/delete.calendars.js');

const getPayments = require('./payments/get.payments.js');
const postPayments = require('./payments/post.payments.js');

const getPatients = require('./patients/get.patient.js');
const postPatients = require('./patients/post.patient.js');
const putPatients = require('./patients/put.patient.js');

const getSymptoms = require('./symptoms/get.symptom.js');
const postSymptoms = require('./symptoms/post.symptom.js');
const deleteSymptoms = require('./symptoms/delete.symptom.js');

const getSpecializations = require('./specializations/get.specializations.js');
const postSpecializations = require('./specializations/post.specialization.js');
const deleteSpecializations = require('./specializations/delete.specialization.js');

const postCertificates = require('./certificates/post.certificates.js');
const deleteCertificates = require('./certificates/delete.certificates.js');

const postMessages = require('./messages/post.messages.js');

const upload = require('../middlewares/multer.middleware.js');
const {verifyToken} = require('../middlewares/auth.middleware.js');

const router = Router();

// Configuramos los routers
router.use('/users', getUsers);
router.use('/users', postUsers);
router.use('/users', putUsers);
router.use('/users', deleteUsers);

router.use('/auth', getAuth);

router.use('/calendars', verifyToken, getCalendars);
router.use('/calendars', verifyToken, postCalendars);
router.use('/calendars', verifyToken, deleteCalendars);
router.use('/calendars', verifyToken, patchCalendars)

router.use('/payments', getPayments);
router.use('/payments', postPayments);

router.use('/patients', verifyToken, getPatients);
router.use('/patients', verifyToken, postPatients);
router.use('/patients', verifyToken, putPatients);

router.use('/symptoms', verifyToken, getSymptoms);
router.use('/symptoms', verifyToken, postSymptoms);
router.use('/symptoms', verifyToken, deleteSymptoms);

// router.use('/specializations', verifyToken, getSpecializations);
router.use('/specializations',  getSpecializations);
router.use('/specializations', verifyToken, postSpecializations);
router.use('/specializations', verifyToken, deleteSpecializations);

router.use('/certificates', verifyToken, deleteCertificates);
router.use('/certificates', [verifyToken, upload], postCertificates);
router.use('/uploads', [verifyToken, upload], postCertificates);

router.use('/messages', verifyToken, postMessages);


module.exports = router;