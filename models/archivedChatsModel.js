const Sequelize = require('sequelize')

const sequelize = require('../util/database')

const ArchivedChats = sequelize.define('archived_chats', {
    id: {
        type: Sequelize.INTEGER,
        allowedNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowedNull: false
    },
    message: {
        type: Sequelize.STRING,
        allowedNull: false
    },
    userId: {
        type: Sequelize.INTEGER,
        allowedNull: false,
    },
    groupId: {
        type: Sequelize.INTEGER,
        allowedNull: false,
    }

})

module.exports = ArchivedChats;