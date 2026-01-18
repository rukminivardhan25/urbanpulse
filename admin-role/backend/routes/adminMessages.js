const express = require('express');
const router = express.Router();
const adminMessageController = require('../controllers/adminMessageController');
const { verifyAdminToken } = adminMessageController;

// All routes require admin authentication
router.use(verifyAdminToken);

// Send a message
router.post('/', adminMessageController.sendMessage);

// Get messages for a complaint
router.get('/:complaintId', adminMessageController.getMessages);

// Get unread message counts for all admin's complaints
router.get('/unread/count', adminMessageController.getUnreadCount);

module.exports = router;

