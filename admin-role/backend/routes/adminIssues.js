const express = require('express');
const router = express.Router();
const adminIssueController = require('../controllers/adminIssueController');
const { verifyAdminToken } = adminIssueController;

// All routes require admin authentication
router.use(verifyAdminToken);

// Get all issues assigned to admin (with optional status filter)
router.get('/', adminIssueController.getAdminIssues);

// Get a single issue by ID
router.get('/:id', adminIssueController.getIssueById);

// Update issue status
router.patch('/:id/status', adminIssueController.updateIssueStatus);

// Add internal note to issue
router.post('/:id/notes', adminIssueController.addInternalNote);

module.exports = router;

