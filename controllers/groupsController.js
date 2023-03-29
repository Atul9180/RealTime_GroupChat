const Groups = require('../models/groupsModel')
const Users = require('../models/usersModel')
const { Op } = require("sequelize")


//@desc: Load group list user is memberOf to screen
exports.findGroups = async (req, res) => {
    try {
        const groups = await Groups.findAll();
        const usergroups = groups.filter(group => {
            const members = JSON.parse(group.members);
            return members.includes(req.user.id);
        });
        res.status(200).send(usergroups);
    } catch (error) {
        next(error);
    }
};


//@desc: create new group if not exists
exports.createGroup = async (req, res, next) => {
    try {
        const members = req.body.members.map(member => parseInt(member));
        members.push(req.user.id);
        const [group, created] = await Groups.findOrCreate({
            where: {
                name: req.body.name
            },
            defaults: {
                members: JSON.stringify(members),
                admins: JSON.stringify([req.user.id]),
                userId: req.user.id
            }
        });

        if (!created) {
            return res.status(400).send({ message: 'Group with the same name already exists' });
        }

        res.status(201).send(group);
    } catch (err) {
        console.log(err);
        next(err);
    }
};


//@desc: Getting Group Profile Details:
exports.getGroupProfileDesc = async (req, res) => {
    try {
        const group = await Groups.findOne({ where: { id: req.query.groupId } });
        if (group) {
            const members = JSON.parse(group.members);
            const users = await Users.findAll({
                where: { id: members },
                attributes: ['id', 'name']
            });
            if (users) {
                const userDetails = users.map(user => ({
                    id: user.id,
                    name: user.name
                }));
                res.status(200).send({ group, users: userDetails });
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: 'Internal server error' });
    }
}


//@desc: remove/Exit user from group
exports.removeUserFromGroup = async (req, res) => {
    try {
        const { groupid, targetUserId } = req.body;
        const group = await Groups.findOne({ where: { id: groupid } });

        let members = JSON.parse(group.members)
        members.splice(members.indexOf(targetUserId), 1)
        let admins = JSON.parse(group.admins)
        let index = admins.indexOf(targetUserId)
        if (index > -1) {
            admins.splice(index, 1)
        }
        group.members = JSON.stringify(members)
        group.admins = JSON.stringify(admins)
        const response = await group.save();
        if (response) {
            return res.status(201).send(response)
        }

    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");

    }
}


//@desc: make user Admin
exports.makeAdmin = async (req, res) => {
    try {
        const { groupid, targetUserId } = req.body;
        const group = await Groups.findOne({ where: { id: groupid } });
        let admins = JSON.parse(group.admins);
        admins.push(targetUserId);
        group.admins = JSON.stringify(admins);
        const response = await group.save();
        res.status(201).send(response);
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error.");
    }
};


//@desc: revoke user's Admin power
exports.removeAsAdmin = async (req, res) => {
    try {
        const { groupid, targetUserId } = req.body;
        const group = await Groups.findOne({ where: { id: groupid } });
        let admins = JSON.parse(group.admins);
        admins.splice(admins.indexOf(targetUserId), 1);
        group.admins = JSON.stringify(admins);
        const response = await group.save();
        res.status(201).send(response);
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error.");
    }
};


//@desc: to Add more user(non-members) PopUp 
exports.addUsersToGroup = async (req, res) => {
    try {
        const group = await Groups.findOne({ where: { id: req.query.groupId }, attributes: ['members'] });
        const members = JSON.parse(group.members);
        const nonMembers = await Users.findAll({
            attributes: ['id', 'name'],
            where: {
                id: {
                    [Op.notIn]: members
                }
            }
        });
        res.status(200).send(nonMembers);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};


//@updating members in Group by admin
exports.updateGroupsMembers = async (req, res) => {
    try {
        const { id, newmembers } = req.body;
        const group = await Groups.findOne({ where: { id } });
        if (!group) {
            return res.status(404).send({ message: 'Group not found' });
        }
        const members = JSON.parse(group.members);
        const updatedMembers = [...members, ...newmembers].map(Number);
        group.members = JSON.stringify(updatedMembers);
        const response = await group.save();
        res.status(200).send({ message: 'Group members updated successfully', response });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

