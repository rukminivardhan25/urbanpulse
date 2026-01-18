const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');

// Submit a new issue
router.post('/', issueController.createIssue);

// Get all issues for the logged-in user
router.get('/', issueController.getUserIssues);

// Get a single issue by ID (for logged-in user only)
router.get('/:id', issueController.getIssueById);

// Delete an issue (for logged-in user only)
router.delete('/:id', issueController.deleteIssue);

module.exports = router;

