const Sequelize = require('sequelize')

const sequelize = require('../util/database')

const Users = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        allowedNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowedNull: false
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowedNull: false
    },
    phone: {
        type: Sequelize.STRING,
        allowedNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowedNull: false
    }
})

module.exports = Users;