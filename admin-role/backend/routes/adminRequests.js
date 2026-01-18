const express = require('express');
const router = express.Router();
const adminRequestController = require('../controllers/adminRequestController');

// All request routes require admin authentication
router.use(adminRequestController.verifyAdminToken);

// Get all requests (with optional status filter)
router.get('/', adminRequestController.getAllRequests);

// Get a single request by ID
router.get('/:id', adminRequestController.getRequestById);

// Approve a request
router.patch('/:id/approve', adminRequestController.approveRequest);

// Reject a request
router.patch('/:id/reject', adminRequestController.rejectRequest);

module.exports = router;

