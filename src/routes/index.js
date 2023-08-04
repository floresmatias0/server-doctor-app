const { Router } = require('express');

//Importamos los routers
const getUsers = require('./users/get.user.js');
const postUsers = require('./users/post.user.js');

const router = Router();

// Configuramos los routers
router.use('/users', getUsers);
router.use('/users', postUsers);

module.exports = router;