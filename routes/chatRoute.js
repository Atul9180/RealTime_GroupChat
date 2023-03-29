const express = require('express');
const router = express.Router();


const chatsController = require('../controllers/chatsController');
const imageController = require("../controllers/imageController");
const authenticate = require('../middleware/auth');


router.get('/chats/getAllChats', authenticate.authenticate, chatsController.getAllChats);
router.post('/chats/saveChatMsg', authenticate.authenticate, chatsController.postChat);
router.post('/chats/upload', authenticate.authenticate, imageController.uploadImage);


module.exports = router;