const express = require('express');
const router = express.Router();
const helperController = require('../controllers/helperController');

// Create a help offer
router.post('/', helperController.createHelper);

// Get all helpers for a request (only request creator)
router.get('/request/:requestId', helperController.getHelpersByRequest);

// Get helper count for a request (only request creator)
router.get('/count/:requestId', helperController.getHelperCount);

// Get helper record for current user and request (for helper to chat)
router.get('/user/:requestId', helperController.getUserHelper);

module.exports = router;

