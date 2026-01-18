const express = require('express');
const router = express.Router();
const adminServiceController = require('../controllers/adminServiceController');

// All routes require admin authentication
router.use(adminServiceController.verifyAdminToken);

// Create service
router.post('/', adminServiceController.createService);

// Get admin's services
router.get('/admin', adminServiceController.getAdminServices);

// Delete service
router.delete('/:id', adminServiceController.deleteService);

module.exports = router;




