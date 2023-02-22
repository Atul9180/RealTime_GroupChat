const express = require('express');

const groupsController = require('../controllers/groupsController');

const authenticate = require('../middleware/auth');

const router = express.Router();

router.get('/groups', authenticate.authenticate, groupsController.findGroups)

router.post('/groups', authenticate.authenticate, groupsController.createGroup)

router.put('/removeUserFromGroup', authenticate.authenticate, groupsController.removeUserFromGroup)

router.get('/group/getProfileDesc', authenticate.authenticate, groupsController.getGroupProfileDesc)

router.put('/makeAdmin', authenticate.authenticate, groupsController.makeAdmin)

router.put('/removeAsAdmin', authenticate.authenticate, groupsController.removeAsAdmin)


router.get('/addUsersToGroup', authenticate.authenticate, groupsController.addUsersToGroup)

router.put('/updateGroupsMembers', authenticate.authenticate, groupsController.updateGroupsMembers)

module.exports = router;