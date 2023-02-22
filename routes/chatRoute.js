const express = require('express');
const chatsController = require('../controllers/chatsController');
const authenticate=require('../middleware/auth')

const router = express.Router();

router.get('/chats/getAllChats', authenticate.authenticate, chatsController.getAllChats)

router.get('/chats/getnewChats', authenticate.authenticate, chatsController.getnewChats)

router.post('/chats/saveChatMsg',authenticate.authenticate, chatsController.postChat)



module.exports=router;