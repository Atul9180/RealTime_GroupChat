const Chats = require('../models/chatsModel');
const { Op } = require("sequelize");

//@desc:  Get All Chats
exports.getAllChats = async (req, res) => {
  try {
    const response = await Chats.findAll({
      where: { groupId: req.query.groupId },
    });
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};


//@desc: get otherUsers Chats if exists:
exports.getnewChats = async (req, res) => {
  try {
    const { id } = req.query;
    //console.log({ line18: id });
    const response = await Chats.findAll({
      where: {
        id: { [Op.gt]: parseInt(id) },
        groupId: parseInt(req.query.groupId),
      }
    });
    if (response) {
      return res.status(200).send(response);
    }
    else {
      return res.status(400).json({ message: "no new chat found", success: "fail" });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}


//@desc: To Post/Store Chat
exports.postChat = async (req, res, next) => {
  try {
    const chat = await Chats.create({
      name: req.user.name,
      message: req.body.message,
      userId: req.user.id,
      groupId: req.body.groupId
    });
    res.status(201).send(chat);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to create chat" });
  }
};



// exports.getChats = async (req, res, next) => {
//     try {
//     let response;
//     if (req.query.lastId) {
//     response = await Chats.findAll({
//     where: {
//     id: {
//     [seqlObj.gt]: parseInt(req.query.lastId),
//     },
//     groupId: parseInt(req.query.groupId),
//     },
//     });
//     } else {
//     response = await Chats.findAll({
//     where: { groupId: req.query.groupId },
//     });
//     }
//     res.status(200).send(response);
//     } catch (error) {
//     res.status(500).send({ error: error.message });
//     }
//     };