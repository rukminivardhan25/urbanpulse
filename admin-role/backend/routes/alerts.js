const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

// Create a new alert
router.post('/', alertController.createAlert);

// Get all alerts for admin
router.get('/admin', alertController.getAdminAlerts);

// Delete an alert
router.delete('/:id', alertController.deleteAlert);

module.exports = router;


