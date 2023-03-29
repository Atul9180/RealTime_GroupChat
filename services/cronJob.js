const Chats = require('../models/chatsModel');
const ArchivedChat = require('../models/archivedChatsModel');
const cron = require('cron');
const { Op } = require('sequelize');


const job = new cron.CronJob('0 0 * * *', async () => {
    try {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);   // Calculate date for 1 day ago

        const oldChats = await Chats.findAll({
            where: {
                createdAt: {
                    [Op.lt]: oneDayAgo
                }
            }
        });

        // Move old chats to ArchivedChat table
        await ArchivedChat.bulkCreate(oldChats.map(chat => ({
            id: chat.id,
            message: chat.message,
            name: chat.name,
            createdAt: chat.createdAt,
            userId: chat.userId,
            groupId: chat.groupId
        })));

        // Delete old chats from Chats table
        await Chats.destroy({
            where: {
                createdAt: {
                    [Op.lt]: oneDayAgo
                }
            }
        });

        console.log(`Moved ${oldChats.length} old chats to ArchivedChat table and deleted them from Chats table`);
    } catch (error) {
        console.error('Error in cron job:', error);
    }
});

module.exports = { job }