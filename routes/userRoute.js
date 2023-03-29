const express = require('express');
const router = express.Router();

const usersController = require('../controllers/usersController');
const authenticate = require('../middleware/auth');


router.post('/users/signup', usersController.createUser);
router.post('/users/signin', usersController.signUser);
router.get('/users/getAllUsers', authenticate.authenticate, usersController.getUsers);



module.exports = router;