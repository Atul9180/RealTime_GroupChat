const express = require('express');

const usersController = require('../controllers/usersController');

const authenticate=require('../middleware/auth')

const router = express.Router();

router.post('/users/signup', usersController.createUser)

router.post('/users/signin', usersController.signUser)

router.get('/users/getAllUsers', authenticate.authenticate, usersController.getUsers)

module.exports=router;