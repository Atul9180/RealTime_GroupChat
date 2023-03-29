const express = require('express');
const chatsController = require('../controllers/chatsController');
const imageController = require("../controllers/imageController");
const authenticate = require('../middleware/auth');
//const { multerMiddleware } = require("../middleware/multer.js")

const router = express.Router();

router.get('/chats/getAllChats', authenticate.authenticate, chatsController.getAllChats);
router.post('/chats/saveChatMsg', authenticate.authenticate, chatsController.postChat);
router.post('/chats/upload', authenticate.authenticate, imageController.uploadImage);


module.exports = router;