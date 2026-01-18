const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

// Create a new help request
router.post('/', requestController.createRequest);

// Get all requests created by the logged-in user
router.get('/my-requests', requestController.getUserRequests);

// Get all approved requests (visible in Help Requests)
router.get('/approved', requestController.getApprovedRequests);

// Get a single request by ID
router.get('/:id', requestController.getRequestById);

// Delete a request by ID
router.delete('/:id', requestController.deleteRequest);

module.exports = router;

