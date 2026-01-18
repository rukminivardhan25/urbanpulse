const Service = require('../models/Service');
const dateService = require('../services/dateService');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'your-admin-secret-key-change-in-production';

/**
 * Middleware to verify admin JWT token
 */
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminId = decoded.id;
    req.adminCity = decoded.city;
    req.adminArea = decoded.area;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

/**
 * Create a new service
 * POST /services
 */
exports.createService = async (req, res) => {
  try {
    const {
      serviceType,
      serviceSubtype,
      startTime,
      endTime,
      scheduleType,
      customDate,
      notes,
    } = req.body;

    if (!serviceType || !scheduleType) {
      return res.status(400).json({
        success: false,
        message: 'Service type and schedule type are required',
      });
    }

    // Calculate service date based on schedule type
    let serviceDate;
    try {
      serviceDate = dateService.calculateServiceDate(
        scheduleType,
        customDate ? new Date(customDate) : null
      );
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Validate time format (HH:MM)
    if (startTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(startTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start time format. Use HH:MM format.',
      });
    }

    if (endTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid end time format. Use HH:MM format.',
      });
    }

    const service = new Service({
      adminId: req.adminId,
      adminCity: req.adminCity,
      adminArea: req.adminArea,
      serviceType,
      serviceSubtype: serviceSubtype || '',
      startTime: startTime || null,
      endTime: endTime || null,
      scheduleType,
      serviceDate,
      notes: notes || '',
      displayFormat: '12hr',
    });

    await service.save();

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service: {
        id: service._id,
        serviceType: service.serviceType,
        serviceSubtype: service.serviceSubtype,
        startTime: service.startTime,
        endTime: service.endTime,
        scheduleType: service.scheduleType,
        serviceDate: dateService.formatISTDate(service.serviceDate),
        notes: service.notes,
      },
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service',
    });
  }
};

/**
 * Get all services for an admin (for admin dashboard)
 * GET /services/admin
 */
exports.getAdminServices = async (req, res) => {
  try {
    const services = await Service.find({
      adminId: req.adminId,
      isActive: true,
    })
      .sort({ serviceDate: -1, createdAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      services: services.map((service) => ({
        id: service._id,
        serviceType: service.serviceType,
        serviceSubtype: service.serviceSubtype || '',
        startTime: service.startTime,
        endTime: service.endTime,
        scheduleType: service.scheduleType,
        serviceDate: dateService.formatISTDate(service.serviceDate),
        notes: service.notes,
        createdAt: service.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error getting admin services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get services',
    });
  }
};

/**
 * Delete a service
 * DELETE /services/:id
 */
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findOne({
      _id: id,
      adminId: req.adminId,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    // Hard delete for immediate removal
    await Service.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
    });
  }
};

// Export middleware
exports.verifyAdminToken = verifyAdminToken;

