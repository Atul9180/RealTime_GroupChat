const Sequelize = require('sequelize')

const sequelize = require('../util/database')

const Groups = sequelize.define('groups', {
    id: {
        type: Sequelize.INTEGER,
        allowedNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        unique: true,
        allowedNull: false
    },
    members: {
        type: Sequelize.TEXT,
        allowedNull: false
    },
    admins: {
        type: Sequelize.TEXT,
        allowedNull: false
    }
})

module.exports = Groups;