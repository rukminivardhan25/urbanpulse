const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// Public endpoint - get services by city and area
router.get('/', serviceController.getServices);

// Protected endpoints - require admin authentication
router.use(serviceController.verifyAdminToken);

// Create service
router.post('/', serviceController.createService);

// Get admin's services
router.get('/admin', serviceController.getAdminServices);

// Delete service
router.delete('/:id', serviceController.deleteService);

module.exports = router;




