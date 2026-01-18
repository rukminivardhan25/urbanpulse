const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

// Get alerts for users
router.get('/', alertController.getAlerts);

module.exports = router;


