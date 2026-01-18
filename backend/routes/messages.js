const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Send a message
router.post('/', messageController.sendMessage);

// Get messages for a complaint
router.get('/:complaintId', messageController.getMessages);

// Get unread message counts for all user's complaints
router.get('/unread/count', messageController.getUnreadCount);

// Helper-requester messages
router.post('/helper', messageController.sendHelperMessage);
router.get('/helper/:requestId/:helperId', messageController.getHelperMessages);

module.exports = router;

